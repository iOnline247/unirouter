const types = {
  get(prop) {
    return Object.prototype.toString.call(prop);
  },
  null: "[object Null]",
  object: "[object Object]",
  array: "[object Array]",
  string: "[object String]",
  boolean: "[object Boolean]",
  number: "[object Number]",
  date: "[object Date]",
};
const randomNumber = (min = 0, max = Number.MAX_SAFE_INTEGER) => {
  const randomNum = Math.random() * (max - min) + min;

  return Math.floor(randomNum);
};

export default class Schema {
  constructor(definition) {
    this.defineSchema(definition);
  }

  defineSchema(definition) {
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(definition)) {
      const type = types.get(value);
      let output;

      if (type === types.object) {
        output = this.defineSchema(value);
      } else if (type === types.array) {
        // TODO:
        // Fix this, obviously... ;)
        output = value.fill(0);
      } else if (type === types.null) {
        output = null;
      } else if (type === types.boolean) {
        output = Math.random() > 0.5;
      } else if (type === types.number) {
        output = randomNumber();
      } else if (type === types.date) {
        const year = randomNumber(1900, new Date().getFullYear() + 1);
        const month = randomNumber(0, 12);
        const day = randomNumber(1, 32);
        const hours = randomNumber(0, 25);
        const minutes = randomNumber(0, 61);
        const seconds = randomNumber(0, 61);
        const millis = randomNumber(0, 1000);

        output = new Date(
          year,
          month,
          day,
          hours,
          minutes,
          seconds,
          millis
        ).toISOString();
      }

      this[key] = output;
    }
  }
}
