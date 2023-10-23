export function groupBy(objectArray, property) {
  return objectArray.reduce((acc, obj) => {
    const key = obj[property];
    if (!acc[key]) {
      acc[key] = [];
    }
    // Add object to list for given key's value
    acc[key].push(obj);
    return acc;
  }, {});
}

export function groupByPropType(objectArray, property, countProp) {
  return objectArray.reduce((acc, obj) => {
    const key = obj[property]['S'];
    if (!acc[key]) {
      acc[key] = 0;
    }
    // Add object to list for given key's value
    acc[key] += parseInt(obj[countProp]['N'])
    return acc;
  }, {});
}

export function guidify(articleId) {
  return [
    articleId.substring(0, 8),
    articleId.substring(8, 12),
    articleId.substring(12, 16),
    articleId.substring(16, 20),
    articleId.substring(20)
  ].join('-')
}

export function unGuidify(articleId) {
  return articleId.replace(/-/g, '')
}

export function reGuidify(articleId) {
  let temp = unGuidify(articleId)
  return guidify(temp)
}