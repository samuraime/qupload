const qiniu = require('qiniu');

const configUpload = ({
  accessKey,
  secretKey,
  bucket,
  zone = 'z0',
  domain = '',
}) => {
  const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);

  const options = {
    scope: bucket,
  };
  const putPolicy = new qiniu.rs.PutPolicy(options);
  const uploadToken = putPolicy.uploadToken(mac);

  const config = new qiniu.conf.Config();
  // 空间对应的机房
  // 华东  qiniu.zone.Zone_z0
  // 华北  qiniu.zone.Zone_z1
  // 华南  qiniu.zone.Zone_z2
  // 北美  qiniu.zone.Zone_na0
  config.zone = qiniu.zone[`Zone_${zone}`];
  // 是否使用https域名
  // config.useHttpsDomain = useHttpsDomain;
  // 上传是否使用cdn加速
  // config.useCdnDomain = useCdnDomain;

  const bucketManager = new qiniu.rs.BucketManager(mac, config);
  const getURL = key => bucketManager.publicDownloadUrl(domain, key);

  return function upload(file, key) {
    const formUploader = new qiniu.form_up.FormUploader(config);
    const putExtra = new qiniu.form_up.PutExtra();

    return new Promise((resolve, reject) => {
      formUploader.putFile(uploadToken, key, file, putExtra, (error, body, info) => {
        if (error) {
          reject(error);
          return;
        }
        if (info.statusCode === 200) {
          resolve({
            ...body,
            url: getURL(body.key),
          });
        } else {
          reject(new Error(`QiniuUploadError: ${info.statusCode}`));
        }
      });
    });
  };
};

module.exports = configUpload;
