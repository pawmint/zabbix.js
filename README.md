zabbix.js
===========

Currently there is a bug where the client will crash when Zabbix's database is down. This is because Zabbix returns a HTML page from the API
instead of returning a proper JSONRPC API error response. I have created a ticket on the Zabbix ticket tracker, until it gets fixed I
will implement a change that will detect if we get HTML or JSON before parsing it.

You can see the status of the ticket here: https://support.zabbix.com/browse/ZBX-5565

Description
-----------

A small client for the Zabbix API based around the excellent [request.js](https://github.com/mikeal/request) library.

I hacked this together quick because I needed a way to pull data from Zabbix into node for a project.

How to use
----------

As per the Zabbix API you *MUST* get the api version first, and then authenticate to do pretty much anything.

Look in the examples folder for how it's done :)

I can't promise I won't change how this works with regards to how the module is structured, but it will stay pretty much the same :)

Contributing
------------

Please let me know if I have done something in a stupid way, or you have suggestions or whatnot.

I am on IRC (Freenode) with the same nick as here, or just contact me here.

This is my first node.js module, and basically the first thing I've done in javascript too, so I bet there are mistakes and things to learn.

I will be adding more features and useful things as I go along, as well as make a full test suite with Mocha, I just need to learn it first.


