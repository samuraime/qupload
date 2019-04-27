# qupload [![npm version](https://badge.fury.io/js/qupload.svg)](https://badge.fury.io/js/qupload) [![CircleCI](https://circleci.com/gh/samuraime/qupload.svg?style=shield)](https://circleci.com/gh/samuraime/qupload)

CLI上传七牛CDN

## Install

```sh
npm install qupload
```

## Config

通过配置文件```.quploadrc```或```--config```参数指定JSON文件.  
或者完全通过环境变量: QUPLOAD_ACCESS_KEY, QUPLOAD_SECRET_KEY, QUPLOAD_BUCKET, QUPLOAD_ZONE, QUPLOAD_DOMAIN.

```json
{
  "accessKey": "foo",
  "secretKey": "bar",
  "bucket": "test",
  "zone": "z0",
  "domain": "http://cdn.example.com"
}
```

- zone: 空间对应的机房. 华东: z0, 华北: z1, 华南: z2, 北美: na0. 默认z0
- domain: cdn域名, 用于拼接下载地址, 可选

## Usage

```
Usage: qupload [options] files|directories

Options:
  --version        Show version number                                 [boolean]
  --config, -c     Path to JSON config file                             [string]
  --recursive, -r  递归遍历目录                                        [boolean]
  --prefix, -p     上传key前缀                            [string] [default: ""]
  --use-hash       使用SHA1作为key                    [boolean] [default: false]
  --use-path       使用文件相对路径作为key前缀        [boolean] [default: false]
  --disable-key    禁用key, 使用七牛默认方式生成      [boolean] [default: false]
  --help           Show help                                           [boolean]
```

## Example

假设有此文件: ```./build/js/index.js```

- 上传单个文件

```sh
qupload ./build/js/index.js
# ✔ [./build/js/index.js] http://cdn.samuraime.com/index.js
```

- 指定前缀, 使用原文件名作为文件名

```sh
qupload -r --prefix=test/ ./build/
# ✔ [build/js/index.js] http://cdn.samuraime.com/test/index.js
```

- 指定前缀, 并且使用文件路径作为分割, 使用原文件名作为文件名

```sh
qupload -r --prefix=test/ --use-path ./build/
# ✔ [build/js/index.js] http://cdn.samuraime.com/test/js/index.js
```

- 指定前缀, 并且使用文件路径作为分割, 使用 hash 作为文件名

```sh
qupload -r --prefix=test/ --use-path --use-hash ./build/
# ✔ [build/js/index.js] http://cdn.samuraime.com/test/js/b58d988070d02e44d27a6b019e23a1665bd1f790
```

- 禁用 key 生成规则, 使用七牛上传策略saveKey字段所指定魔法变量生成 Key

```sh
qupload -r --disable-key ./build/
# ✔ [build/js/index.js] http://cdn.samuraime.com/FrWNmIBw0C5E0nprAZ4joWZb0feQ
```

## License

[MIT](LICENSE)
