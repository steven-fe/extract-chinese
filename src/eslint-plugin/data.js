const createEntriesInfo = () => ({
  templateLiteralMap: new Map(),
  textMap: new Map(),
  dict: {},

  autoProcessTextSet: new Set(),
  manualProcessTextMap: new Map(),
  textToPathMap: new Map(),
});

const _entriesInfo = createEntriesInfo();

export const entriesInfo = _entriesInfo;
export const resetEntriesInfo = () =>
  Object.assign(_entriesInfo, createEntriesInfo());
