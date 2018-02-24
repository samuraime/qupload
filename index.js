#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const findUp = require('find-up');
const yargs = require('yargs');
const Listr = require('listr');
const configUpload = require('./lib/config-upload');
const flatten = require('./lib/flatten');

const configPath = findUp.sync(['.quploadrc', '.qupload.json']);
const config = configPath ? JSON.parse(fs.readFileSync(configPath)) : {};

const {
  _: inputs, prefix, recursive, hash,
} = yargs
  .config(config)
  .usage('Usage: $0 [options] file|directory')
  .option('recursive', {
    alias: 'r',
    describe: '递归遍历目录',
    type: 'boolean',
  })
  .option('prefix', {
    alias: 'p',
    default: '',
    describe: '上传路径前缀',
    type: 'string',
  })
  .option('hash', {
    alias: 'h',
    describe: '使用hash作为key',
    type: 'boolean',
  })
  .help()
  .argv;


const upload = configUpload(config);

try {
  const localFiles = flatten(inputs, recursive);
  const tasks = new Listr(localFiles.map(file => ({
    title: `[${file}]`,
    async task(ctx, task) {
      const key = hash ? undefined : `${prefix}${path.parse(file).base}`;
      const { url } = await upload(file, key);
      // eslint-disable-next-line
      task.title += ` ${url}`;
    },
  })), {
    concurrent: true,
  });

  tasks.run().catch((error) => {
    console.error(error.message);
  });
} catch (error) {
  console.error(error.message);
}

