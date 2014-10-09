var str = JSON.stringify;
var config = {
  url: 'XURLX',
  user: 'XUSERX',
  password: 'XPASSWORDX'
};

module.exports = {
  config: config,
  authid: 'xzx',
  authResponseBody: str({ result: 'xzx' }),
  authRequest: {
    method: 'POST',
    uri: config.url,
    headers: { 'content-type': 'application/json-rpc' },
    body: str({
      jsonrpc: '2.0',
      id: 1,
      auth: null,
      method: 'user.authenticate',
      params: {
        user: config.user,
        password: config.password
      }
    })
  },
  versionRequest: {
    method: 'POST',
    uri: config.url,
    headers: { 'content-type': 'application/json-rpc' },
    body: str({
      jsonrpc: '2.0',
      id: 1,
      auth: null,
      method: 'apiinfo.version',
      params: {}
    })
  },
  errorResponseBody: {
    jsonrpc: "2.0",
    error: {
      code: -32602,
      message: "Invalid params.",
      data: "Not authorized"
    },
    id: 2
  },
  successfulResponseBody: {
    result: 'abc'
  }
};
