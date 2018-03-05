# qupload

CLI上传七牛CDN

## Install

```sh
npm install -g qupload
```

## Config

通过配置文件```.quploadrc```或```--config```参数指定JSON文件

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

- 上传单个文件

```sh
qupload ./test.js
```

- 指定前缀, 使用原文件名作为文件名

```sh
qupload -r --prefix=test/ ./test/
```

- 指定前缀, 并且使用文件路径作为分割, 使用原文件名作为文件名

```sh
qupload -r --prefix=test/ --use-path ./test/
```

- 指定前缀, 并且使用文件路径作为分割, 使用 hash 作为文件名

```sh
qupload -r --prefix=test/ --use-path --use-hash ./test/
```

- 禁用 key 生成规则, 使用七牛上传策略saveKey字段所指定魔法变量生成 Key

```sh
qupload -r --disable-key ./test/
```

## License

[MIT](LICENSE)
