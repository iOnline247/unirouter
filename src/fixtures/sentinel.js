const sentinel = {
  bossSauce: {
    responses: [
      {
        status: 503,
        response: { deathRay: "fire" },
      },
      {
        status: 200,
        response: { count: 116, sentries: [1, 2, 3] },
      },
      {
        status: 200,
        response: { count: 2222, sentries: [2222, 222, 222, 22, 2] },
      },
    ],
  },
  engage: {
    responses: [
      {
        status: 400,
        response: { count: 999, sentries: [999, 99, 9] },
      },
      {
        status: 503,
        response: { photons: "locked", phasers: "stun" },
      },
      {
        status: 200,
        response: { count: 2222, sentries: [2222, 222, 222, 22, 2] },
      },
      {
        status: 200,
        response: { count: 3333, klingons: [3333, 333, 33, 3] },
      },
    ],
  },
};

export default sentinel;
