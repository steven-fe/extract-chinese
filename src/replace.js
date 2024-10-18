import { ESLint } from 'eslint';
import tsParser from '@typescript-eslint/parser';
import * as espree from 'espree';
import { createRequire } from 'node:module';
import * as fsPromise from 'node:fs/promises';
import * as path from 'node:path';
import * as prettier from 'prettier';
import eslintPluginCoinstore, { meta } from './eslint-plugin/index.js';
import { entriesInfo, resetEntriesInfo } from './eslint-plugin/data.js';
import log from './utils/log.js';
import dirExists from './utils/dir-exists.js';
import { getPaths, mergeMap } from './utils/lodash-plus.js';
import _ from 'lodash';
import Base from './base.js';
import { importLocalFile } from './utils/index.js';

const require = createRequire(import.meta.url);
const vueParserPath = require.resolve('vue-eslint-parser');

class Replace extends Base {
  constructor() {
    super();
    this.commonTranslateMap = new Map();
  }

  async getTextToPathMap(namespace) {
    let object = {};

    try {
      object = (
        await importLocalFile(
          path.join(process.cwd(), `${this.config.languagesDirPath}/${this.config.mainLanguage}/${namespace}.js`),
        )
      ).default.dicts;
    } catch {}

    return getPaths(object).reduce((translateMap, path) => {
      const text = _.get(object, path);
      // if (typeof text !== "string") throw new Error("text 不是 string");
      if (typeof text !== 'string') debugger;
      const pathArray = translateMap.get(text) ?? [];

      pathArray.push([namespace, ...path]);
      return translateMap.set(text, pathArray);
    }, new Map());
  }

  async replaceText({ urls }) {
    const eslint = new ESLint({
      fix: true,
      plugins: { [meta.name]: eslintPluginCoinstore },
      ignore: false,
      useEslintrc: false,
      overrideConfig: {
        settings: { replace: true },
        extends: ['plugin:coinstore/default'],
        parser: vueParserPath,
        parserOptions: {
          sourceType: 'module',
          ecmaVersion: 'latest',
          ecmaFeatures: { jsx: true },
          parser: { js: espree, jsx: espree, ts: tsParser, tsx: tsParser },
        },
        rules: { 'prettier/prettier': 'off' },
      },
    });

    const results = await eslint.lintFiles(urls);

    await ESLint.outputFixes(results);
  }

  async extractText({ urls, namespace }) {
    const eslint = new ESLint({
      fix: true,
      plugins: { [meta.name]: eslintPluginCoinstore },
      ignore: false,
      useEslintrc: false,
      overrideConfig: {
        settings: { replace: false },
        extends: ['plugin:coinstore/default'],
        parser: vueParserPath,
        parserOptions: {
          sourceType: 'module',
          ecmaVersion: 'latest',
          ecmaFeatures: { jsx: true },
          parser: { js: espree, jsx: espree, ts: tsParser, tsx: tsParser },
        },
        rules: { 'prettier/prettier': 'off' },
      },
    });

    await eslint.lintFiles(urls);
    await this.outputEntries({ namespace });
  }

  async outputEntries({ namespace }) {
    const { autoProcessTextSet, manualProcessTextMap } = entriesInfo;
    const directory = path.join(process.cwd(), `${this.config.entriesDirPath}`);
    await dirExists(directory);

    if (!autoProcessTextSet.size && !manualProcessTextMap.size) return;

    await fsPromise.writeFile(
      path.join(directory, `entry-chinese-${namespace}.json`),
      await prettier.format(
        JSON.stringify(
          [...autoProcessTextSet].reduce((jsonObj, text) => {
            jsonObj[text] = text;
            return jsonObj;
          }, {}),
        ),
        {
          parser: 'json',
        },
      ),
    );

    if (manualProcessTextMap.size) {
      await fsPromise.writeFile(
        path.join(directory, `manual-chinese-${namespace}.json`),
        await prettier.format(
          JSON.stringify({
            namespace,
            ...Object.fromEntries(manualProcessTextMap.entries()),
          }),
          {
            parser: 'json',
          },
        ),
      );
    }
  }

  async start() {
    await this.setConfig();

    this.commonTranslateMap = await this.getTextToPathMap(this.config.commonNamespace);

    for (const { namespace, fileList, excludeFileList } of this.config.tasks.values()) {
      resetEntriesInfo();

      try {
        entriesInfo.textToPathMap = mergeMap(await this.getTextToPathMap(namespace), this.commonTranslateMap);

        const urls = fileList.reduce(
          (urls, filePath) =>
            urls.concat(
              Replace.getFiles({
                rootPath: path.join(process.cwd(), filePath),
                excludeFileList,
                callbackFn: ({ ext }) => Replace.fileExtension.includes(ext),
              }),
            ),
          [],
        );

        await this.replaceText({ urls });
        await this.extractText({ urls, namespace });
      } catch (e) {
        debugger;
      }
    }

    resetEntriesInfo();
    log.success('替换中文成功，请检查待翻译的词条文件。');
  }
}

export default () => {
  new Replace().start();
};
