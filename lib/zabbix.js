// Dragons and whatnot below, my first module!
require('longjohn');
var request = require ('request');


var Client = function (url, user, password) {
  this.url = url;
  this.user = user;
  this.password = password;
  this.rpcid = 0;
  this.authid = null;
};

Client.prototype.call = function call(method, params, callback) {
  console.log("::zabbix method: " + method + " params: " + JSON.stringify(params));
  request(
    { method: 'POST'
    , uri: this.url
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
  this.call('apiinfo.version', {}, function (err, resp, res) {
    if (!err) {
      callback(null, resp, res);
    }
    else {
      callback(err, resp, res);
    }
  });
};
Client.prototype.authenticate = function authenticate(callback) {
  this.rpcid = 0; // Reset this, why not?
  var self = this; //REMEMBER THAT YOU NEED THIS.
  this.call('user.authenticate',
  {
    "user": this.user,
    "password" : this.password
  }, function (err, resp, res) {
    if (!err) {
      self.authid = res.result;

      callback(null, resp, res);
    }
    else {
      callback(err, resp, res);
    }
  });
};

exports.Client = Client;
