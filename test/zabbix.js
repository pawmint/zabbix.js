var should = require('should');
var sinon = require('sinon');
var mockery = require('mockery');
var fix = require('./fixtures');

describe('Zabbix client', function () {
  beforeEach(function () {
    mockery.enable({
      useCleanCache: true
    });

    mockery.registerAllowables(['../lib/zabbix', './errors', 'util']);

    this.request = sinon.stub();
    mockery.registerMock('request', this.request);

    var Client = require('../lib/zabbix');
    this.client = new Client(fix.config.url, fix.config.user, fix.config.password);
  });

  it('should have debug off by default', function () {
    this.client.debug.should.be.false;
  });

  describe('.authenticate', function () {

    it('should have a method', function () {
      this.client.authenticate.should.be.a.Function;
    });

    it('should call zabbix api', function () {
      this.request.callCount.should.eql(0);

      this.client.authenticate();
      
      this.request.callCount.should.eql(1);
      this.request.firstCall.args[0].should.eql(fix.authRequest);
    });

    it('should init reconnect counts and authid', function () {
      var authid = fix.authid;
      var cb = sinon.spy();
      this.client.authid = '--' + authid;
      this.request.onFirstCall().callsArgWith(1, null, {statusCode: 200}, fix.authResponseBody);

      this.client.authenticate(cb);

      this.client.authid.should.eql(authid);
    });

  });

  describe('.call', function () {

    it('should propagate the error from request', function () {
      var cb = sinon.spy();
      var error = new Error('RequestError');
      this.request.onFirstCall().callsArgWith(1, error);

      this.client.call('method', {}, cb);

      cb.firstCall.args[0].should.eql(error);
    });

    it('should throw on parse error', function () {
      var cb = sinon.spy();
      this.request.onFirstCall().callsArgWith(1, null, {statusCode: 200}, '{ unparsable');
      
      this.client.call('method', {}, cb);

      cb.firstCall.args[0].should.be.instanceOf(this.client.errors.ZabbixError);
      cb.firstCall.args[0].should.have.property('message', 'Parsing response body failed.');
    });

    it('should propagate the error from RPC', function () {
      var cb = sinon.spy();
      this.request.onFirstCall().callsArgWith(1, null, {statusCode: 200}, JSON.stringify(fix.errorResponseBody));
      
      this.client.call('method', {}, cb);

      cb.firstCall.args[0].should.be.instanceOf(this.client.errors.ZabbixError);
      cb.firstCall.args[0].should.have.property('message', fix.errorResponseBody.error.message);
      cb.firstCall.args[0].should.have.property('description', fix.errorResponseBody.error.data);
    });

    it('should do successful requests', function () {
      var cb = sinon.spy();
      this.request.onFirstCall().callsArgWith(1, null, {statusCode: 200}, JSON.stringify(fix.successfulResponseBody));
      
      this.client.call('method', {}, cb);

      (cb.firstCall.args[0] === null).should.be.true;
      cb.firstCall.args[2].should.eql(fix.successfulResponseBody);
    });

    it('should give invalid parameters error on [412]', function () {
      var cb = sinon.spy();
      this.request.onFirstCall().callsArgWith(1, null, {statusCode: 412}, '{}');

      this.client.call('method', {}, cb);

      cb.firstCall.args[0].should.be.instanceOf(this.client.errors.ZabbixError);
      cb.firstCall.args[0].should.have.property('message', 'Invalid parameters.');
    });

  });

  describe('.getApiVersion', function () {

    it('should call zabbix api', function () {
      this.request.callCount.should.eql(0);

      this.client.getApiVersion();
      
      this.request.callCount.should.eql(1);
      this.request.firstCall.args[0].should.eql(fix.versionRequest);
    });

  });

  afterEach(function () {
    mockery.deregisterMock('request');
    mockery.disable();
  });
  
});
