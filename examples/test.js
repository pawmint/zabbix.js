var z = require ('./lib/zabbix');

var zabbix = new z.Client('http://zabbix.test.sparebank1.no/api_jsonrpc.php','e3130', 'zabbix');

zabbix.getApiVersion(function (err, resp, result) {
  console.log("Error: " + err + " response: " + resp.statusCode + " result: " + JSON.stringify(result));
});
zabbix.getApiVersion(function (err, resp, result) {
  console.log("Error: " + err + " response: " + resp.statusCode + " result: " + JSON.stringify(result));
});
zabbix.getApiVersion(function (err, resp, result) {
  console.log("Error: " + err + " response: " + resp.statusCode + " result: " + JSON.stringify(result));
});
zabbix.getApiVersion(function (err, resp, result) {
  console.log("Error: " + err + " response: " + resp.statusCode + " result: " + JSON.stringify(result));
});
zabbix.getApiVersion(function (err, resp, result) {
  console.log("Error: " + err + " response: " + resp.statusCode + " result: " + JSON.stringify(result));
});
zabbix.getApiVersion(function (err, resp, result) {
  console.log("Error: " + err + " response: " + resp.statusCode + " result: " + JSON.stringify(result));
});



