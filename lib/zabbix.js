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
  var nr = this.rpcid + 1;
  var log = this.debug ? console.log.bind(console, '::zabbix['+nr+']') : (function(){});

  log('method: ', method, ' params: ', JSON.stringify(params));

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
    }, function (error, response, body) {
      var result = null;
      if (error) {
        log('error: ', error);
        callback(error, response, body);
      }
      else {
        log('response: ', body);
        if (response.statusCode == 200 && 'undefined' !== typeof body) {
          result = JSON.parse(body);
          callback(null, response, result);
        }
        else if (response.statusCode == 412) {
          callback(new Error('Invalid parameters.'), response, body);
        }
        else {
          // 1.9.6 just returns a empty response with Content-Length 0 if the method does not exist.
          // 2.x returns a proper response!
          if (this.apiversion == '1.2') {
            callback(new Error('That method does most likely not exist.'), response, 'Method missing!');
          }
          // If we get here something else is broken, we should look into this more and handle more special cases (in a general way).
          else {
            callback(new Error('Something else went wrong'), response, body);
          }

        }
      }
    }.bind(this)
  );
};

Client.prototype.getApiVersion = function getApiVersion(callback) {
  this.call('apiinfo.version', {}, function (error, resp, res) {
    if (!error) {
      this.apiversion = res.result;
    }

    callback(error, resp, res);
  }.bind(this));
};

Client.prototype.authenticate = function authenticate(callback) {
  this.rpcid = 0; // Reset this, why not?
  this.call('user.authenticate', {
      'user': this.user,
      'password' : this.password
    }, function (error, resp, res) {
      if (!error) {
        this.authid = res.result;
      }

      callback(error, resp, res);
    }.bind(this)
  );
};

module.exports = Client;
