var assert = require("assert");
var lconf = require('../index');
var fs = require('fs');

describe('lconf', function() {
  it('should return an instance of Parser', function() {
    var i = lconf();
    assert.equal("function", typeof(i.parse), "lconf.parse should be a function");
    assert.equal("function", typeof(i.suppress), "lconf.suppress should be a function");
    assert.equal("function", typeof(i.opts), "lconf.opts should be a function");
  });
});

describe('Parser', function() {
  before(function() {
    try{
      fs.unlinkSync('_test.yaml');
      fs.unlinkSync('_test.json');
      fs.unlinkSync('_test.js');
    } catch (e){}
    
    fs.writeFileSync('_test.yaml', "invoice: 34843\r\ndate   : true\r\nbill-to: ben");
    fs.writeFileSync('_test.json', '{"invoice": 34843, "date":true,"bill-to":"ben"}');
    fs.writeFileSync('_test.js', 'module.exports = {"invoice": 34843, "date":true,"bill-to":"ben"};');
  });

  it('should parse yaml config', function() {
    var conf =  lconf();

    var opts =  conf.parse('./_test.yaml')
                .opts();

    assert.equal(typeof(opts), "object", "opts shouldn't be type: "+typeof(opts));
    assert.deepEqual(opts, {"./_test.yaml": {invoice: 34843, date: true, "bill-to": "ben"}}, "opts shouldn't be "+JSON.stringify(opts));
  });

  it('should parse json config', function() {
    var conf =  lconf();
    
    var opts =  conf.parse('./_test.json')
                .opts();

    assert.equal(typeof(opts), "object", "opts shouldn't be type: "+typeof(opts));
    assert.deepEqual(opts, {"./_test.json": {invoice: 34843, date: true, "bill-to": "ben"}}, "opts shouldn't be "+JSON.stringify(opts));
  });

  it('should parse js config', function() {
    var conf =  lconf();

    var opts =  conf.parse('./_test.js')
                .opts();

    assert.equal(typeof(opts), "object", "opts shouldn't be type: "+typeof(opts));
    assert.deepEqual(opts, {"./_test.js": {invoice: 34843, date: true, "bill-to": "ben"}}, "opts shouldn't be "+JSON.stringify(opts));
  });

  it('should parse multiple config', function() {
    var conf =  lconf();

    var opts =  conf.parse('./_test.yaml')
                .parse('./_test.json')
                .parse('./_test.js')
                .opts();

    assert.equal(typeof(opts), "object", "opts shouldn't be type: "+typeof(opts));
    assert.deepEqual(opts, {
      "./_test.yaml": {invoice: 34843, date: true, "bill-to": "ben"},
      "./_test.json": {invoice: 34843, date: true, "bill-to": "ben"},
      "./_test.js": {invoice: 34843, date: true, "bill-to": "ben"}
    }, "opts shouldn't be "+JSON.stringify(opts));
  });

  it('should clear opts() after calling it', function() {
    var conf =  lconf();

    var opts =  conf.parse('./_test.yaml')
                .opts();

    assert.deepEqual(opts, {
      "./_test.yaml": {invoice: 34843, date: true, "bill-to": "ben"}
    }, "opts shouldn't be "+JSON.stringify(opts));

    var opts2 = conf.opts();
    assert.deepEqual(opts2, {}, "opts2 shouldn't be "+JSON.stringify(opts2));
  });

  it('should support reuse after opts()', function() {
    var conf =  lconf();

    var opts =  conf.parse('./_test.yaml')
                .opts();

    assert.deepEqual(opts, {"./_test.yaml": {invoice: 34843, date: true, "bill-to": "ben"}}, "opts shouldn't be "+JSON.stringify(opts));

    var opts2 = conf.parse('./_test.json').opts();
    assert.deepEqual(opts2, {"./_test.json": {invoice: 34843, date: true, "bill-to": "ben"}}, "opts shouldn't be "+JSON.stringify(opts2));
  });

  it('should throw if file doesn\'t exist', function() {
    var conf = lconf();
    assert.throws(function() {
      conf.parse("nonsense.yaml").opts();
    }, function(err) {
      return /aggregate/.test(err.error);
    }, "should throw aggregate exception");
  });

  it('should throw if file has no extension', function() {
    var conf = lconf();
    assert.throws(function() {
      conf.parse("nonsense").opts();
    }, function(err) {
      return /aggregate/.test(err.error);
    }, "should throw aggregate exception");
  });

  it('should throw if file has unsupported extension', function() {
    var conf = lconf();
    assert.throws(function() {
      conf.parse("nonsense.pie").opts();
    }, function(err) {
      return /aggregate/.test(err.error);
    }, "should throw aggregate exception");
  });

  it('shouldn\'t throw if file doesn\'t exist, and suppress() is used', function() {
    var conf = lconf();
    assert.doesNotThrow(function() {
      conf.suppress().parse("nonsense.yaml").opts();
    }, "shouldn't throw exception");
  });

  it('shouldn\'t throw if file has no extension, and suppress() is used', function() {
    var conf = lconf();
    assert.doesNotThrow(function() {
      conf.suppress().parse("nonsense").opts();
    }, "shouldn't throw exception");
  });

  it('shouldn\'t throw if file has unsupported extension, and suppress() is used', function() {
    var conf = lconf();
    assert.doesNotThrow(function() {
      conf.suppress().parse("nonsense.pie").opts();
    }, "shouldn't throw exception");
  });

  after(function() {
    fs.unlinkSync('_test.yaml');
    fs.unlinkSync('_test.json');
    fs.unlinkSync('_test.js');
  });
});