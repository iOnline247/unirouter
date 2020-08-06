const myProject = {
  scenario1: {
    responses: [
      {
        status: 200,
        response: { test: true },
      },
      {
        status: 201,
        response: { test: true, here: [1, 2, 3] },
      },
      {
        status: 400,
        response: { msg: "Invalid Request" },
      },
    ],
  },
};

export default myProject;
