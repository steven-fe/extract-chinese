import _ from 'lodash';
import { entriesInfo } from './data.js';
import { insertTranslate } from './utils.js';

export function hasChinese(s) {
  const reg = new RegExp('[\\u4E00-\\u9FFF]+', 'g');
  return reg.test(s);
}

export function trimSpecial(string = '') {
  const pattern = /[`~!@#$^\-&*()=|{}':;',\\\[\]\.<>\/?~！@#￥……&*（）——|{}【】'；：""'。，、？\s]/g;
  return string.replace(pattern, '');
}

export function unmatchedIdentifier(name) {
  return ['t', 'log', '$t'].includes(name);
}

export function statisticalEntry(text) {
  if (!hasChinese(text)) return;
  if (entriesInfo.textMap.has(text)) return;

  entriesInfo.textMap.set(text, text);
  entriesInfo.dict[text] = text;
}

export function createEntryInfo(rawText) {
  if (!hasChinese(rawText)) return;

  const text = rawText.trim();
  const languageKeyPath = entriesInfo.textToPathMap.get(text)?.[0];

  return { rawText, text, languageKeyPath };
}

export function replaceText({ node, entryInfo, context, replaceType }) {
  if (!entryInfo) return;

  const { type } = node;
  const { rawText, text, languageKeyPath } = entryInfo;

  const templateCode = i18nTemplateCode(replaceType, languageKeyPath);

  // 修复函数
  let fixFun = (fixer) => null;

  // js 也会走这里
  if (type === 'Literal') {
    fixFun = function* (fixer) {
      const [start, end] = node.range;
      yield* insertTranslate(node, fixer);
      yield fixer.replaceTextRange([start, end], rawText.replace(text, templateCode));
    };
  }

  if (type === 'TemplateElement') {
    debugger;
    // fixFun = (fixer) => {
    //   const [start, end] = node.range;
    //   const { value } = node;
    //   const { raw } = value;
    //   // 需要减去的长度,需要动态变化
    //   let reduceLen = end - start - 1 - raw.length;
    //   reduceLen = reduceLen === 2 ? 2 : 1; // 存在字符差异，进行抹平
    //   return fixer.replaceTextRange(
    //     [start + 1, end - reduceLen],
    //     rawText.replace(text, "${" + templateCode + "}"),
    //   );
    // };
  }

  if (type === 'VText') {
    fixFun = (fixer) => {
      const [start, end] = node.range;
      return fixer.replaceTextRange([start, end], rawText.replace(text, '{{' + templateCode + '}}'));
    };
  }

  if (type === 'VAttribute') {
    fixFun = (fixer) => {
      const { key } = node;
      // const [start, end] = node.range
      return fixer.replaceText(node, ':' + key.name + '=' + '"' + templateCode + '"');
    };
  }

  if (type === 'JSXText') {
    fixFun = function* (fixer) {
      const [start, end] = node.range;
      yield* insertTranslate(node, fixer);
      yield fixer.replaceTextRange([start, end], rawText.replace(text, '{' + templateCode + '}'));
    };
  }

  if (type === 'JSXAttribute') {
    fixFun = function* (fixer) {
      const { name } = node;
      yield* insertTranslate(node, fixer);
      yield fixer.replaceText(node, name.name + '=' + '{' + templateCode + '}');
    };
  }

  context.report({ node, message: '替换为:' + templateCode, fix: fixFun });
}

export function i18nTemplateCode(replaceType, languageKeyPath) {
  const languageKey = languageKeyPath.map((path, index) => `['${index ? path : _.camelCase(path)}']`).join('');

  switch (replaceType) {
    case 'js': {
      return `$t(\`${languageKey}\`)`;
    }
    case 'vueOptions': {
      return `this.$t(\`${languageKey}\`)`;
    }
    case 'vueTemplate': {
      return `$t(\`${languageKey}\`)`;
    }
    default: {
      return `$t(\`${languageKey}\`)`;
    }
  }
}

export function findTemplateLiteral(rawText, node, fileName) {
  const createLocString = (filename, line, column) => `${filename}:${line},${column}`;

  if (!hasChinese(rawText)) return;
  if (node.type !== 'TemplateLiteral') return;

  const startLoc = createLocString(fileName, node.loc.start.line, node.loc.start.column);

  if (!entriesInfo.templateLiteralMap.has(startLoc)) {
    entriesInfo.templateLiteralMap.set(startLoc, [
      startLoc,
      createLocString(fileName, node.loc.end.line, node.loc.end.column),
    ]);
  }
}
