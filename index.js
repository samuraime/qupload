#!/usr/bin/env node

const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const findUp = require('find-up');
const yargs = require('yargs');
const Listr = require('listr');
const configUpload = require('./lib/config-upload');
const flatten = require('./lib/flatten');

const getHash = file => new Promise((resolve, reject) => {
  const hash = crypto.createHash('sha1');
  const stream = fs.createReadStream(file);
  stream.on('readable', () => {
    const data = stream.read();
    if (data) {
      hash.update(data);
    } else {
      resolve(hash.digest('hex'));
    }
  });
  stream.on('error', reject);
});

const getKey = async (file, prefix, usePath, relativeFrom, useHash) => {
  let key = prefix;
  if (usePath) {
    const relativePath = path.relative(relativeFrom, file);
    const relative = path.dirname(relativePath);
    key += relative === '.' ? '' : `${relative}/`;
  }
  key += useHash ? await getHash(file) : path.parse(file).base;
  return key;
};

const {
  _: inputs, prefix, recursive, useHash, usePath, disableKey, config: cliConfigPath,
} = yargs
  .usage('Usage: $0 [options] files|directories')
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
    describe: '上传key前缀',
    type: 'string',
  })
  .option('use-hash', {
    default: false,
    describe: '使用SHA1作为key',
    type: 'boolean',
  })
  .option('use-path', {
    default: false,
    describe: '使用文件相对路径作为key前缀',
    type: 'boolean',
  })
  .option('disable-key', {
    default: false,
    describe: '禁用key, 使用七牛默认方式生成',
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
  const tasks = new Listr(localFiles.map(({ file, relativeFrom }) => ({
    title: `[${file}]`,
    async task(ctx, task) {
      const key = disableKey
        ? undefined
        : await getKey(file, prefix, usePath, relativeFrom, useHash);
      const { url } = await upload(file, key);
      // eslint-disable-next-line
      task.title += ` ${url}`;
    },
  })), {
    concurrent: true,
    exitOnError: false,
  });

  tasks.run().catch((error) => {
    console.error(error.message);
  });
} catch (error) {
  console.error(error.message);
}

