var z = require ('../lib/zabbix');

var zabbix = new z.Client('http://zabbix.test.sparebank1.no/api_jsonrpc.php','e3130', 'zabbix');

zabbix.getApiVersion(function (err, resp, result) {
  if (!err) {
    console.log("Unauthenticated API version request, and the version is: " + result.result)
  }
});
zabbix.authenticate(function (err, resp, result) {
  if (!err) {
    console.log("Authenticated!");
  }
  zabbix.getApiVersion(function (err, resp, result) {
    console.log("Zabbix API version is: " + result.result);
  });
  //console.log("Client authid is: " + this.authid);
  zabbix.call("host.get",
    {
    "search" : {"host" : ""},
    "groupids" : "2",
    "output" : "extend",
    "sortfield" : "host",
    "searchWildcardsEnabled" : 1
    }
    ,function (err, resp, result) {
      if (!err) {
        //console.log(resp + " result: " + JSON.stringify(result));
      }
    });
});






