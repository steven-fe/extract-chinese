/*
  语言文件说明
*/

// 语言名称
const name = 'English'
// 语言代码
const code = 'en_US'
// 语言排序
const sort = 1

// 自动加载多语言字典文件 下面函数第一个参数为字典文件所在目录名称
const dictsFiles = require.context('./en_US', false, /.js$/)
const dicts = dictsFiles.keys().reduce((dicts, path) => {
  const dict = dictsFiles(path).default
  dicts[dict.section] = dict.dicts
  return dicts
}, {})
export { name, code, sort, dicts }
