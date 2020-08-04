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

(async function () {
  const promiseeeees = [getData(), getData(), getData()];

  await Promise.all(promiseeeees);
})();
