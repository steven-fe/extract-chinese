import { ESLint } from "eslint";
import tsParser from "@typescript-eslint/parser";
import * as espree from "espree";
import { createRequire } from "node:module";
import * as fs from "node:fs";
import * as fsPromise from "node:fs/promises";
import * as path from "node:path";
import * as prettier from "prettier";
import eslintPluginCoinstore, { meta } from "./eslint-plugin/index.js";
import { entriesInfo, resetEntriesInfo } from "./eslint-plugin/data.js";
import log from "./utils/log.js";
import dirExists from "./utils/dir-exists.js";

const require = createRequire(import.meta.url);
const vueParserPath = require.resolve("vue-eslint-parser");

async function extractChinese({ namespace, urls, entryDirPath, replace }) {
  const eslint = new ESLint({
    fix: true,
    plugins: { [meta.name]: eslintPluginCoinstore },
    overrideConfig: {
      settings: { replace },
      extends: ["plugin:coinstore/default"],
      parser: vueParserPath,
      parserOptions: {
        sourceType: "module",
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        parser: { js: espree, jsx: espree, ts: tsParser, tsx: tsParser },
      },
      rules: { "prettier/prettier": "off" },
    },
  });

  const results = await eslint.lintFiles(urls);

  if (replace) {
    await ESLint.outputFixes(results);
  } else {
    const directory = path.join(process.cwd(), `${entryDirPath}`);
    await dirExists(directory);

    fs.writeFileSync(
      path.join(directory, `entry-chinese-${namespace}.json`),
      await prettier.format(JSON.stringify(entriesInfo.dict), {
        parser: "json",
      })
    );

    if (entriesInfo.templateLiteralMap.size) {
      fs.writeFileSync(
        path.join(directory, `manual-chinese-${namespace}.json`),
        await prettier.format(
          JSON.stringify({
            namespace,
            ...Object.fromEntries(entriesInfo.templateLiteralMap.entries()),
          }),
          {
            parser: "json",
          }
        )
      );
    }
  }
}

class ExtractChinese {
  static fileExtension = [".vue", ".js", ".jsx"];

  static getFiles(rootPath) {
    const fileList = [];

    let filePathList = fs.statSync(rootPath).isFile()
      ? [rootPath]
      : fs.readdirSync(rootPath).map((file) => path.join(rootPath, file));

    while (filePathList.length) {
      const nextFilePathList = [];

      filePathList.forEach((filePath) => {
        const states = fs.statSync(filePath);
        const info = path.parse(filePath);

        if (states.isFile()) {
          if (ExtractChinese.fileExtension.includes(info.ext)) {
            fileList.push(filePath);
          }
        } else {
          nextFilePathList.push(
            ...fs.readdirSync(filePath).map((file) => path.join(filePath, file))
          );
        }
      });

      filePathList = nextFilePathList;
    }

    return fileList;
  }

  constructor() {
    this.configFilePath = path.join(
      process.cwd(),
      "cs-handle-languages-config.mjs"
    );
  }

  async checkConfigFile() {
    try {
      await fsPromise.access(this.configFilePath, fsPromise.constants.R_OK);
      return true;
    } catch {
      log.error("请在项目根目录设置 cs-handle-languages-config.mjs 文件");
      return false;
    }
  }

  async start() {
    if (!(await this.checkConfigFile())) return;

    const {
      default: { entryDirPath, taskList },
    } = await import(this.configFilePath);

    for (const task of taskList) {
      const { namespace, fileList } = task;
      const urls = fileList.reduce(
        (urls, filePath) =>
          urls.concat(
            ExtractChinese.getFiles(path.join(process.cwd(), filePath))
          ),
        []
      );

      await extractChinese({ namespace, urls, entryDirPath });

      resetEntriesInfo();
    }

    log.success("提取中文词条成功！");
  }
}

export default () => {
  new ExtractChinese().start();
};
