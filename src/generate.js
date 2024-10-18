import _ from 'lodash';
import Base from './base.js';
import { importLocalFile, readJsonFile } from './utils/index.js';
import * as fsPromise from 'node:fs/promises';
import * as path from 'node:path';
import * as prettier from 'prettier';
import log from './utils/log.js';
import { hasChinese } from './eslint-plugin/tools.js';

class Generate extends Base {
  constructor() {
    super();
  }

  async getEntryFileInfoList() {
    return (
      await Generate.getFiles({
        rootPath: path.join(process.cwd(), this.config.entriesDirPath),
      })
    ).reduce((entryFileInfoList, filePath) => {
      const filePathInfo = path.parse(filePath);
      const result = /(?<=^entry-chinese-)\S+(?=\.json$)/.exec(filePathInfo.base);
      if (result)
        entryFileInfoList.push({
          namespace: result[0],
          filePath,
          filePathInfo: filePathInfo,
        });
      return entryFileInfoList;
    }, []);
  }

  objectToMap(object) {
    return _.transform(
      object,
      (map, value, key) => {
        return map.set(key, value);
      },
      new Map(),
    );
  }

  async getLegalKeyMap({ namespace, mainLanguageEntries, otherLanguagesEntries }) {
    let keyIndex = 0;
    const existedLanguageKey = await this.getExistedLanguageKey(namespace);
    const illegalKey2LegalKeyMap = [...mainLanguageEntries.keys()].reduce((illegalKey2LegalKeyMap, illegalKey) => {
      const legalKey = (() => {
        const checkKey = (key) => !existedLanguageKey.includes(key) && !illegalKey2LegalKeyMap.has(key);
        const tempLegalKey = hasChinese(illegalKey) ? otherLanguagesEntries.get('en_US').get(illegalKey) : illegalKey;
        let key = tempLegalKey;

        if (!tempLegalKey) {
          const msg = `namespace - ${namespace} 未找到 illegalKey - ${illegalKey}`;
          log.error(msg);
          throw new Error(msg);
        }

        if (/['"]/.test(tempLegalKey) || tempLegalKey.length > 80) {
          do {
            debugger;
            key = `text_${++keyIndex}`;
          } while (!checkKey(key));
        } else {
          while (!checkKey(key)) {
            debugger;
            key = `${tempLegalKey}_${++keyIndex}`;
          }
        }

        return key;
      })();

      return illegalKey2LegalKeyMap.set(illegalKey, legalKey);
    }, new Map());
    const legalKey2IllegalKeyMap = new Map(
      [...illegalKey2LegalKeyMap.entries()].map(([illegalKey, legalKey]) => [legalKey, illegalKey]),
    );
    return { illegalKey2LegalKeyMap, legalKey2IllegalKeyMap };
  }

  removeExtraMapKey(map, referenceMap) {
    const result = _.cloneDeep(map);
    const toRemoveKey = _.differenceWith([...map.keys()], [...referenceMap.keys()], _.isEqual);
    toRemoveKey.forEach((key) => result.delete(key));
    return result;
  }

  async getOtherLanguagesEntries({ mainLanguageEntries, entryFileName, namespace }) {
    const allFilePathList = await Generate.getFiles({ rootPath: this.config.translateDirPath });
    const entryFilePath = allFilePathList.find((filePath) => filePath.endsWith(entryFileName));

    if (!entryFilePath) {
      const msg = `namespace - ${namespace} 未找到产品给到的多语言文件！！`;
      log.error(msg);
      throw new Error(msg);
    }

    const languages = new Map();
    const filePathList = await Generate.getFiles({ rootPath: path.parse(entryFilePath).dir });

    for (const filePath of filePathList) {
      const languageKey = (() => {
        if (/英语?/.test(path.parse(filePath).name)) return 'en_US';
      })();

      if (languageKey) {
        languages.set(
          languageKey,
          this.removeExtraMapKey(this.objectToMap(await readJsonFile(filePath)), mainLanguageEntries),
        );
      }
    }

    return languages;
  }

  checkExternalLanguageFiles({ namespace, mainLanguageEntries, otherLanguagesEntries }) {
    const entryKeys = Object.keys(mainLanguageEntries);
    return [...otherLanguagesEntries.entries()].every(([languageKey, languageEntry]) => {
      const diff = _.differenceWith(entryKeys, Object.keys(languageEntry), _.isEqual);
      const isBad = diff.length;
      if (isBad) {
        log.error(`namespace - ${namespace} / languageKey - ${languageKey} 缺失词条: ${diff.join(', ')}`);
      }
      return !isBad;
    });
  }

  async getExistedLanguageKey(namespace) {
    let languageKey = [];
    try {
      languageKey = Object.keys(
        (await importLocalFile(`${process.cwd()}/${this.config.languagesDirPath}/${this.config.mainLanguage}/${namespace}.js`))
          .default.dicts,
      );
    } catch {}
    return languageKey;
  }

  async writeLanguageFile({ languageId, namespace, languageObject }) {
    let dicts = {};
    const filePath = `${process.cwd()}/${this.config.languagesDirPath}/${languageId}/${namespace}.js`;
    try {
      dicts = (await importLocalFile(filePath)).default.dicts;
    } catch {}
    const nextDicts = { ...dicts, ...languageObject };
    await fsPromise.writeFile(
      filePath,
      await prettier.format(
        `export default { section: '${_.camelCase(namespace)}', dicts: ${JSON.stringify(nextDicts)} }`,
        {
          parser: 'babel',
        },
      ),
    );
  }

  async createLanguagesFile({ namespace, filePath, filePathInfo }) {
    const mainLanguageEntries = this.objectToMap(await readJsonFile(filePath));
    const otherLanguagesEntries = await this.getOtherLanguagesEntries({
      mainLanguageEntries,
      entryFileName: filePathInfo.base,
      namespace,
    });

    if (!this.checkExternalLanguageFiles({ namespace, mainLanguageEntries, otherLanguagesEntries })) {
      const msg = `namespace - ${namespace} 词条与产品给到的多语言文件之间存在差异，请解决！`;
      log.error(msg);
      throw new Error(msg);
    }

    const { illegalKey2LegalKeyMap, legalKey2IllegalKeyMap } = await this.getLegalKeyMap({
      namespace,
      mainLanguageEntries,
      otherLanguagesEntries,
    });

    for (const { languageId, entries } of [
      { languageId: this.config.mainLanguage, entries: mainLanguageEntries },
      ...[...otherLanguagesEntries.entries()].map(([languageId, entries]) => ({ languageId, entries })),
    ]) {
      const languageObject = [...entries.entries()].reduce((languageObject, [illegalKey, text]) => {
        languageObject[illegalKey2LegalKeyMap.get(illegalKey)] = text;
        return languageObject;
      }, {});
      await this.writeLanguageFile({ languageId, namespace, languageObject });
    }
  }

  async start() {
    await this.setConfig();

    const entryFileInfoList = await this.getEntryFileInfoList();

    for (const entryFileInfo of entryFileInfoList) {
      await this.createLanguagesFile(entryFileInfo);
    }

    log.success('生成翻译文件成功，请替换代码中的文案。');
  }
}

export default () => {
  new Generate().start();
};
