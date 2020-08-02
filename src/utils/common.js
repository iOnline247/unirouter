import { promisify } from "util";

const noop = () => {};
const sleep = promisify(setTimeout);

export { noop, sleep };
