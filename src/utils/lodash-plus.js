import _ from "lodash";

export const getPaths = (object) =>
  _.transform(
    object,
    (acc, value, key) => {
      const keys =
        _.isObject(value) && !_.isEmpty(value)
          ? _.map(getPaths(value), (subKey) => _.concat(key, ...subKey))
          : [[key]];

      acc.push(...keys);
    },
    [],
  );

export const mergeMap = (map1, ...mapList) => {
  const result = _.cloneDeep(map1);
  return mapList.reduce((result, map) => {
    for (const [key, value] of map.entries()) result.set(key, value);
    return result;
  }, result);
};
