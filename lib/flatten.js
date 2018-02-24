const { statSync, readdirSync } = require('fs');
const { join } = require('path');

const flatten = (files, recursive) => files.reduce((list, file) => {
  const stat = statSync(file);
  if (stat.isFile()) {
    return list.concat(file);
  }
  if (recursive && stat.isDirectory()) {
    const subFiles = readdirSync(file).map(f => join(file, f));
    return list.concat(flatten(subFiles, recursive));
  }
  return list;
}, []);

module.exports = flatten;
