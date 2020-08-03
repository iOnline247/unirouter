import { promisify } from "util";

const noop = () => {};
const sleep = promisify(setTimeout);
const getValueByKey = (prop, obj) => {
  const key = Object.keys(obj || {}).find(
    (v) => v.toUpperCase() === prop.toUpperCase()
  );

  return obj[key];
};

export { getValueByKey, noop, sleep };
