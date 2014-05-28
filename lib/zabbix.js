var request = require('request');

var Client = function (url, user, password) {
  this.url = url;
  this.user = user;
  this.password = password;
  this.rpcid = 0;
  this.authid = null;
  this.debug = false;
};

Client.prototype.call = function call(method, params, callback) {
  var self = this;
  if (this.debug) {
    console.log('::zabbix method: ' + method + ' params: ' + JSON.stringify(params));
  }

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
      var result = null;
      if (error) {
        callback(error, response, body);
      }
      else {
        if (response.statusCode == 200 && 'undefined' != typeof body){
          result = JSON.parse(body);
          callback(null, response, result);
        }
        else if (response.statusCode == 412) {
          callback(new Error('Invalid parameters.'), response, body);
        }
        else {
          // 1.9.6 just returns a empty response with Content-Length 0 if the method does not exist.
          // 2.x returns a proper response!
          if (self.apiversion == '1.2') {
            callback(new Error('That method does most likely not exist.'), response, 'Method missing!');
          }
          // If we get here something else is broken, we should look into this more and handle more special cases (in a general way).
          else {
            callback(new Error('Something else went wrong'), response, body);
          }

        }
      }
    }
  );
};

Client.prototype.getApiVersion = function getApiVersion(callback) {
  var self = this;
  this.call('apiinfo.version', {}, function (err, resp, res) {
    if (!err) {
      self.apiversion = res.result;
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
  this.call('user.authenticate', {
      'user': this.user,
      'password' : this.password
    }, function (err, resp, res) {
      if (!err) {
        self.authid = res.result;

        callback(null, resp, res);
      }
      else {
        callback(err, resp, res);
      }
    }
  );
};

module.exports = Client;
