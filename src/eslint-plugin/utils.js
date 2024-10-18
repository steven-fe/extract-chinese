import { entriesInfo } from './data.js';
import { createEntryInfo } from './tools.js';

export function getRootNode(node) {
  let rootNode = node;
  while (rootNode.parent) {
    rootNode = rootNode.parent;
  }
  return rootNode;
}

export function getTargetNode(node, callbackFn) {
  let currentNode = node;
  let targetNode = null;

  do {
    targetNode = callbackFn(currentNode) ? currentNode : null;
    currentNode = currentNode?.parent ?? null;
  } while (!targetNode && currentNode);

  return targetNode;
}

export function needInsertTranslate(rootNode) {
  if (rootNode.type !== 'Program') return;

  return !rootNode.body.find(
    (node) =>
      node.type === 'ImportDeclaration' &&
      node.source.value === '@/lang/index' &&
      node.specifiers.find((node) => node.imported.name === '$t'),
  );
}

export function* insertTranslate(node, fixer) {
  const rootNode = getRootNode(node);
  if (needInsertTranslate(rootNode)) {
    yield fixer.insertTextBefore(rootNode, "import { $t } from '@/lang/index'\n");
  }
}

export function manualProcessNode(node, context) {
  let triggerNode = null;
  let locNode = null;

  if ((triggerNode = getTargetNode(node, (node) => node.type === 'TemplateLiteral'))) {
    locNode = getTargetNode(triggerNode, (node) =>
      [
        'ArrowFunctionExpression',
        'JSXExpressionContainer',
        'CallExpression',
        'VariableDeclarator',
        'ReturnStatement',
        'VExpressionContainer',
        'AssignmentExpression',
        'NewExpression',
      ].includes(node?.type),
    );
    if (!locNode) {
      console.log('------- 意外场景 start ------');
      console.log(triggerNode.parent.type);
      console.log(triggerNode.parent.loc);
      console.log(context.getFilename());
      console.log('------- 意外场景 end ------ \n');
    }
  } else {
  }

  return locNode;
}

export function setManualProcessTextMap(context, node) {
  const createLocString = (filePath, line, column) => `${filePath}:${line},${column}`;
  const filePath = context.getFilename();
  const {
    loc: {
      start: { line: startLine, column: startColumn },
      end: { line: endLine, column: endColumn },
    },
  } = node;

  const startLoc = createLocString(filePath, startLine, startColumn);

  if (!entriesInfo.manualProcessTextMap.has(startLoc)) {
    entriesInfo.manualProcessTextMap.set(startLoc, [startLoc, createLocString(filePath, endLine, endColumn)]);
  }
}

export function setAutoProcessTextSet(text) {
  entriesInfo.autoProcessTextSet.add(text);
}

export const handleEntryInfo = (context, node, rawText, replaceFn) => {
  const mode = context.settings.replace ? 'replace' : 'extract';
  const entryInfo = createEntryInfo(rawText);

  if (!entryInfo) return;

  const locNode = manualProcessNode(node, context);
  const needManualProcess = !!locNode;

  if (mode === 'replace') {
    if (!!entryInfo?.languageKeyPath && !needManualProcess) replaceFn(entryInfo);
  } else {
    if (needManualProcess) setManualProcessTextMap(context, locNode);
    else setAutoProcessTextSet(entryInfo.text);
  }
};
