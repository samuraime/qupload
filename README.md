# qupload

CLI上传七牛CDN

## Install

```sh
npm install -g qupload
```

## Config

配置文件```.quploadrc```

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
Usage: qupload [options] file|directory

Options:
  --version        Show version number                                 [boolean]
  --recursive, -r  递归遍历目录                                        [boolean]
  --prefix, -p     上传路径前缀                           [string] [default: ""]
  --hash, -h       使用hash作为key                                     [boolean]
  --help           Show help                                           [boolean]
```

## License

[MIT](LICENSE)
