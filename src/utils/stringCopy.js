/**
 * 生成传入字符串的副本
 * @param {string} string 原字符串
 * @param {object} existedStringSet 已存在字符串的集合，主要用于生成副本时避免重复
 * @param {string} copySuffix 副本后缀
 * @returns {string}
 */
export default function stringCopy(sourceString = '', existedStringSet = {}, copySuffix = '_') {
  // 先去掉 copySuffix 后缀，因为 sourceString 本身可能带有后缀
  const srcStr = sourceString.replace(new RegExp(`${copySuffix}\\d+$`), '');
  let count = 0;
  let result;

  do {
    result = `${srcStr}${count ? copySuffix : ''}${count || ''}`;
    ++count;
  } while (result in existedStringSet);

  return result;
}
