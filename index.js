#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const findUp = require('find-up');
const yargs = require('yargs');
const Listr = require('listr');
const configUpload = require('./lib/config-upload');
const flatten = require('./lib/flatten');

const {
  _: inputs, prefix, recursive, hash, config: cliConfigPath,
} = yargs
  .usage('Usage: $0 [options] file|directory')
  .option('config', {
    alias: 'c',
    describe: 'Path to JSON config file',
    type: 'string',
  })
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
  .demandCommand(1, '至少需指定一个文件或目录')
  .argv;

try {
  const configPath = cliConfigPath || findUp.sync(['.quploadrc', '.qupload.json']);
  const config = configPath ? JSON.parse(fs.readFileSync(configPath)) : {};
  if (!config) {
    throw new Error('未通过 .quploadrc 或 --config 指定配置文件');
  }
  const upload = configUpload(config);
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

