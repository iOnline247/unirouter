// TODO:
// install fetch for node.

const getData = async () => {
  let output;

  try {
    const res = await fetch(`/whack/${Math.floor(Math.random() * 100)}`, {
      method: "GET",
    });

    output = await res.text();
  } catch (err) {
    console.error(err);
  }

  return output;
};
const sleep = function sleep(waitMs) {
  return new Promise((resolve) => setTimeout(resolve, waitMs));
};

(async function init() {
  const promiseeeees = [];

  for (let i = 0; i < 3; i++) {
    // eslint-disable-next-line no-await-in-loop
    await sleep(10);
    promiseeeees.push(getData());
  }

  const responses = await Promise.all(promiseeeees);
  console.log(responses);
})();
