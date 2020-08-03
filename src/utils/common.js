import { promisify } from "util";

const noop = () => {};
const sleep = promisify(setTimeout);
const getValueByKey = (prop, obj) => {
  const key = Object.keys(obj || {}).find(
    (v) => v.toUpperCase() === `${prop}`.toUpperCase()
  );

  return obj[key];
};
const debounce = (func, wait, immediate) => {
  let timeout;
  return (...args) => {
    const later = function later() {
      timeout = null;
      if (!immediate) {
        func(...args);
      }
    };
    const callNow = immediate && !timeout;

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) {
      func(...args);
    }
  };
};

export { debounce, getValueByKey, noop, sleep };
