var request = require('request');
var E = require('./errors');
var async = require('async');

var Client = function (url, user, password) {
  this.url = url;
  this.user = user;
  this.password = password;
  this.rpcid = 0;
  this.authid = null;
  this.debug = false;
};

Client.prototype.errors = E;

Client.prototype.call = function call(method, params, callback) {
  var log = this.debug ? console.log.bind(console, '::zabbix['+(this.rpcid + 1)+']') : (function(){});

  log('method: ', method, ' params: ', JSON.stringify(params));

  request({
    method: 'POST',
    uri: this.url,
    headers: { 'content-type': 'application/json-rpc' },
    body: JSON.stringify({
      jsonrpc : '2.0',
      id: ++this.rpcid,
      auth: this.authid,
      method: method,
      params: params
    })
  }, function (error, response, body) {
    if (error) {
      log('request error: ', error);
      return callback(error, response, body);
    }
    
    log('response['+response.statusCode+']: ', body);
    if (response.statusCode == 200 && 'undefined' !== typeof body) {
      error = null;
      try {
        body = JSON.parse(body);

        if (body.error) {
          error = new E.ZabbixRPCError(body.error);
        }
      } catch(e) {
        error = new E.ZabbixError('Parsing response body failed.');
      }
      // result can also be an error.
      callback(error, response, body);
    } else if (response.statusCode == 412) {
      callback(new E.ZabbixError('Invalid parameters.'), response, body);
    } else {
      // 1.9.6 just returns a empty response with Content-Length 0 if the method does not exist.
      // 2.x returns a proper response!
      if (this.apiversion == '1.2') {
        callback(new E.ZabbixError('That method does most likely not exist.'), response, 'Method missing!');
      } else {
        // If we get here something else is broken, we should look into this more and handle more special cases (in a general way).
        callback(new E.ZabbixError('Something else went wrong'), response, body);
      }

    }
  }.bind(this));
};

Client.prototype.getApiVersion = function getApiVersion(callback) {
  this.call('apiinfo.version', {}, function (error, response, body) {
    if (!error) {
      this.apiversion = body.result;
    }

    callback(error, response, body);
  }.bind(this));
};

//Since the version 2.0 this method is a deprecated alias of user.login
Client.prototype.authenticate = function authenticate(callback) {
  this.rpcid = 0; // Reset this, why not?
  this.call('user.authenticate', {
      'user': this.user,
      'password' : this.password
    }, function (error, response, body) {
      if (!error) {
        this.authid = body.result;
      }

      callback(error, response, body);
    }.bind(this)
  );
};

//Version 2.4 uses the method user.login for authentication
Client.prototype.login = function login(callback) {
  this.rpcid = 0; // Reset this, why not?
  this.call('user.login', {
      'user': this.user,
      'password' : this.password
    }, function (error, response, body) {
	if (!error) {
            this.authid = body.result;
	}
	
	callback(error, response, body);
    }.bind(this)
	   );
};

//Version 2.4 uses the method user.logout
Client.prototype.logout = function logout(callback) {
    this.rpcid = 0; // Reset this, why not?
    this.call('user.logout', {}, function (error, response, body) {
	if (!error) {
	    this.authid = null;
	}
	callback(error, response, body);
    }.bind(this)
	     );
};

Client.prototype.safeCall = function safeCall(method, params, callback) {
    this.rpcid = 0;
    async.series({
	login : function(callback) {
	    this.login(function(err, resp, body) {
		if(err) {
		    return callback(err);	
		};
		callback();
	    });
	},
	call : function(callback) {
	    this.call(method, params, callback);
	},
	logout : function(callback) {
	    this.logout(function(err, resp, body) {
		if(err) {
		    log.error("Error trying to logout from Zabbix Server");
		    return callback(err);	
		};
		callback();
	    });
	}
    }, function (err, results) {
	if(err) return callback(err);
	callback();
    });
}; 

module.exports = Client;
