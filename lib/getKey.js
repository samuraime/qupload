const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

/**
 * 获取文件的SHA1
 *
 * @param {String} file 文件路径
 * @return {Promise}
 */
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

/**
 * 获取上传文件的key
 *
 * @param {String} file 文件路径
 * @param {String} prefix key前缀
 * @param {Boolean} useRelativePath key中使用相对路径
 * @param {String} relativeFrom 相对路径源
 * @param {Boolean} useHash 使用hash作为key
 * @return {Promise}
 */
const getKey = async (file, prefix, useRelativePath, relativeFrom, useHash) => {
  let key = prefix;
  if (useRelativePath) {
    const relativePath = path.relative(relativeFrom, file);
    const relative = path.dirname(relativePath);
    key += relative === '.' ? '' : `${relative}/`;
  }
  key += useHash ? await getHash(file) : path.parse(file).base;
  return key;
};

module.exports = getKey;
