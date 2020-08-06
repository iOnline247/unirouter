const soap = {
  xmlStan: {
    responses: [
      {
        status: 200,
        response: `<?xml version="1.0" encoding="utf-8"?>
<Response>
    <ResponseCode>1</ResponseCode>
    <ResponseMessage>Success</ResponseMessage>
</Response>`,
      },
      {
        status: 201,
        response: `<?xml version="1.0" encoding="utf-8"?>
<Response>
    <ResponseCode>2</ResponseCode>
    <ResponseMessage>Success</ResponseMessage>
</Response>`,
      },
      {
        status: 400,
        response: `<?xml version="1.0" encoding="utf-8"?>
<Response>
    <ResponseCode>3</ResponseCode>
    <ResponseMessage>Failure</ResponseMessage>
</Response>`,
      },
    ],
  },
};

export default soap;
