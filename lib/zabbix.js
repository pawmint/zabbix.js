// Dragons and whatnot below, my first module!
require('longjohn');
var request = require ('request');


var Client = function (url, user, password) {
  this.url = url;
  this.user = user;
  this.password = password;
  this.rpcid = 0;
  this.authid = "";
};

Client.prototype.invokeAPI = function invokeAPI(method, params, callback) {
  request(
    { method: 'POST'
    , uri: 'http://zabbix.test.sparebank1.no/api_jsonrpc.php'
    , headers: { 'content-type': 'application/json-rpc' }
    , body: JSON.stringify({
          jsonrpc : '2.0',
          id: ++this.rpcid,
          auth: this.authid,
          method: method,
          params: params
        })
    }
  , function (error, response, body) {
      if(!error && response.statusCode == 200){
        callback(null, response, JSON.parse(body))
      } else if (!error && response.statusCode == 412) {
        callback("We are doing something wrong", response, null);
      }
      else {
        callback(error, response, JSON.parse(body));
      }
    }
  )
}
Client.prototype.getApiVersion = function getApiVersion(callback) {
  this.invokeAPI('apiinfo.version', [], function (err, resp, res) {
    if (!err) {
      callback(null, resp, res);
    }
    else {
      callback(err, resp, res);
    }
  });
};


exports.Client = Client;
