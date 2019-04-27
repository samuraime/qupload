#!/usr/bin/env node

const fs = require('fs');
const findUp = require('find-up');
const yargs = require('yargs');
const Listr = require('listr');
const configUpload = require('./lib/configUpload');
const list = require('./lib/list');
const getKey = require('./lib/getKey');

const {
  _: inputs,
  prefix,
  recursive,
  useHash,
  usePath,
  disableKey,
  config: cliConfigPath,
  accessKey,
  secretKey,
  bucket,
  zone,
  domain,
} = yargs
  .usage('Usage: $0 [options] files|directories')
  .env('QUPLOAD')
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
  const config = configPath ? JSON.parse(fs.readFileSync(configPath)) : {
    accessKey,
    secretKey,
    bucket,
    zone,
    domain,
  };
  if (!config) {
    throw new Error('未通过 .quploadrc 或 --config 指定配置文件');
  }
  const upload = configUpload(config);
  const localFiles = inputs.reduce((withRelativeFiles, current, index) => {
    const files = list(current, recursive).map(file => ({
      file,
      relativeFrom: inputs[index],
    }));
    return withRelativeFiles.concat(files);
  }, []);
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
  process.exit(1);
}
