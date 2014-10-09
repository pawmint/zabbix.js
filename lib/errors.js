var util = require('util');

module.exports = {
  ZabbixError: ZabbixError,
  ZabbixRPCError: ZabbixRPCError
};

function ZabbixError(msg) {
  if (! (this instanceof ZabbixError)) {
    return new ZabbixError(msg);
  }
  Error.apply(this, [].slice.call(arguments));
  Error.captureStackTrace(this, this.constructor);
  this.message = msg;
  this.name = 'ZabbixError';
}

util.inherits(ZabbixError, Error);

function ZabbixRPCError(errorObject) {
  ZabbixError.call(this, errorObject.message);
  this.message = errorObject.message;
  this.description = errorObject.data;
  this.code = errorObject.code;
  this.name = 'ZabbixRPCError';
}

util.inherits(ZabbixRPCError, ZabbixError);

