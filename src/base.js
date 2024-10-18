import * as fs from 'node:fs';
import * as path from 'node:path';
import _ from 'lodash';
import { importLocalFile } from './utils/index.js';

export default class Base {
  static fileExtension = ['.vue', '.js', '.jsx'];

  static getFiles({ rootPath, excludeFileList, callbackFn }) {
    let fileList = [];

    let filePathList = fs.statSync(rootPath).isFile()
      ? [rootPath]
      : fs.readdirSync(rootPath).map((file) => path.join(rootPath, file));

    while (filePathList.length) {
      const nextFilePathList = [];

      filePathList.forEach((filePath) => {
        const states = fs.statSync(filePath);
        const info = path.parse(filePath);

        if (states.isFile()) {
          if (!callbackFn || (callbackFn && callbackFn(info))) {
            fileList.push(filePath);
          }
        } else {
          nextFilePathList.push(...fs.readdirSync(filePath).map((file) => path.join(filePath, file)));
        }
      });

      filePathList = nextFilePathList;
    }

    if (Array.isArray(excludeFileList)) {
      const excludeFilePathList = excludeFileList.map((filePath) => path.join(process.cwd(), filePath));
      fileList = fileList.filter((filePath) => {
        return !excludeFilePathList.some((excludeFilePath) => filePath.startsWith(excludeFilePath));
      });
    }

    return fileList;
  }

  constructor() {
    this.config = {};
  }

  async setConfig() {
    try {
      this.config = (await importLocalFile(path.join(process.cwd(), 'cs-handle-languages-config.mjs'))).default;
    } catch {
      throw new Error('请在项目根目录设置 cs-handle-languages-config.mjs 文件');
    }
  }
}
