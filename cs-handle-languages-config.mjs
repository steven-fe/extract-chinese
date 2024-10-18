const createTaskMap = (list) =>
  new Map(list.map((item) => [item.namespace, item]))

export default {
  mainLanguage: 'zh_CN',
  commonNamespace: 'common',
  languagesDirPath: './src/lang/languages',
  entriesDirPath: './src/lang/entries', // 待确认
  translateDirPath: '', // 产品给到的翻译文件地址 待确认
  tasks: createTaskMap([
    {
      namespace: 'test-temp', // 分区名称
      fileList: ['src'], // 分区包含的路径，可以是多个
      excludeFileList: ['src/lang']
    }
  ])
}
