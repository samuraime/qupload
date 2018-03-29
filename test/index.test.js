const path = require('path');
const { expect } = require('chai');
const list = require('../lib/list');
const getKey = require('../lib/getKey');

const file = path.resolve(__dirname, 'index.test.js');
const dir = __dirname;
const notexists = path.resolve(__dirname, 'notexists');

describe('list()', () => {
  it('list single', () => {
    const files = list(file);
    expect(files).to.be.an('array');
    expect(files).to.have.lengthOf(1);
  });
  it('list directory', () => {
    const files = list(dir);
    expect(files).to.be.an('array');
    expect(files).to.have.lengthOf(0);
  });
  it('recursively list directory', () => {
    const files = list(dir, true);
    expect(files).to.be.an('array');
    expect(files.length >= 1).to.equal(true);
  });
  it('list not exists file', () => {
    const listNotExists = () => {
      list([notexists]);
    };
    expect(listNotExists).to.throw();
  });
});

describe('getKey()', () => {
  const prefix = 'quploadtest/';
  const relativeFrom = path.resolve(__dirname, '../');

  it('use prefix', async () => {
    const key = await getKey(file, prefix);
    expect(key.startsWith(prefix)).to.equal(true);
  });
  it('use hash', async () => {
    const key = await getKey(file, '', false, null, true);
    expect(key).to.have.lengthOf(40);
  });
  it('use relative path', async () => {
    const key = await getKey(file, '', true, relativeFrom, false);
    expect(key).to.equal('test/index.test.js');
  });
  it('use prefix & relative path', async () => {
    const key = await getKey(file, prefix, true, relativeFrom);
    expect(key).to.equal('quploadtest/test/index.test.js');
  });
  it('use prefix & relative path & hash', async () => {
    const key = await getKey(file, prefix, true, relativeFrom, true);
    expect(key.startsWith('quploadtest/test/')).to.equal(true);
    expect(key).to.match(/\w{40}$/);
  });
});
