const { statSync, readdirSync } = require('fs');
const { join } = require('path');


/**
 * 列出文件
 *
 * @param {String} file 文件路径
 * @param {Boolean} recursive 是否递归遍历目录
 * @return {String[]}
 */
const list = (file, recursive) => {
  const stat = statSync(file);
  if (stat.isFile()) {
    return [file];
  }
  if (recursive && stat.isDirectory()) {
    const subFiles = readdirSync(file).map(f => join(file, f));
    return subFiles.reduce((flatted, current) => (
      flatted.concat(list(current, recursive))
    ), []);
  }
  return [];
};

module.exports = list;
