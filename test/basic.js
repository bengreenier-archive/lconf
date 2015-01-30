var assert = require("assert");
var lconf = require('../index');
var fs = require('fs');
var pathResolver = require('path-resolver').sync;

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

      fs.unlinkSync('./_dir/_test.js');
      fs.unlinkSync('./_dir/_test.json');
      fs.rmdirSync('./_dir');
    } catch (e){}
    
    fs.writeFileSync('_test.yaml', "invoice: 34843\r\ndate   : true\r\nbill-to: ben");
    fs.writeFileSync('_test.json', '{"invoice": 34843, "date":false,"bill-to":"greenier"}');
    fs.writeFileSync('_test.js', 'module.exports = {"invoice": 83, "date":false,"bill-to":"ben"};');

    fs.mkdirSync('./_dir');
    fs.writeFileSync('./_dir/_test.json', '{"invoice": 34843, "date":false,"bill-to":"greenier", "bool":true}');
    fs.writeFileSync('./_dir/_test.js', 'module.exports = {"invoice": 83, "date":false,"bill-to":"ben","bool":true};');
  });

  it('should parse yaml config', function() {
    var conf =  lconf();

    var opts =  conf.parse('./_test.yaml')
                .opts();

    assert.equal(typeof(opts), "object", "opts shouldn't be type: "+typeof(opts));

    var op = {};
    op[pathResolver("./_test.yaml")] = {invoice: 34843, date: true, "bill-to": "ben"};
    assert.deepEqual(opts, op, "opts shouldn't be "+JSON.stringify(opts));
  });

  it('should parse json config', function() {
    var conf =  lconf();
    
    var opts =  conf.parse('./_test.json')
                .opts();

    var op2 = {};
    op2[pathResolver("./_test.json")] = {invoice: 34843, date: false, "bill-to": "greenier"};

    assert.equal(typeof(opts), "object", "opts shouldn't be type: "+typeof(opts));
    assert.deepEqual(opts, op2, "opts shouldn't be "+JSON.stringify(opts));
  });

  it('shouldn\'t parse json config if regex /.?\\.js$/', function() {
    var conf =  lconf();
    
    var opts =  conf.parse('./_test.json', /.?\.js$/)
                .opts();

    assert.deepEqual(opts, {}, "opts shouldn't be "+JSON.stringify(opts));
  });

  it('should parse js config', function() {
    var conf =  lconf();

    var opts =  conf.parse('./_test.js')
                .opts();

    var op3 = {};
    op3[pathResolver("./_test.js")] = {invoice: 83, date: false, "bill-to": "ben"};

    assert.equal(typeof(opts), "object", "opts shouldn't be type: "+typeof(opts));
    assert.deepEqual(opts, op3, "opts shouldn't be "+JSON.stringify(opts));
  });

  it('should parse js config if regex /.?\\.js$/', function() {
    var conf =  lconf();

    var opts =  conf.parse('./_test.js', /.?\.js$/)
                .opts();

    var op3 = {};
    op3[pathResolver("./_test.js")] = {invoice: 83, date: false, "bill-to": "ben"};

    assert.equal(typeof(opts), "object", "opts shouldn't be type: "+typeof(opts));
    assert.deepEqual(opts, op3, "opts shouldn't be "+JSON.stringify(opts));
  });

  it('should parse multiple config', function() {
    var conf =  lconf();

    var opts =  conf.parse('./_test.yaml')
                .parse('./_test.json')
                .parse('./_test.js')
                .opts();

    var op = {};
    op[pathResolver("./_test.yaml")] = {invoice: 34843, date: true, "bill-to": "ben"};
    op[pathResolver("./_test.json")] = {invoice: 34843, date: false, "bill-to": "greenier"};
    op[pathResolver("./_test.js")] = {invoice: 83, date: false, "bill-to": "ben"};

    assert.equal(typeof(opts), "object", "opts shouldn't be type: "+typeof(opts));
    assert.deepEqual(opts, op, "opts shouldn't be "+JSON.stringify(opts));
  });

  it('should clear opts() after calling it', function() {
    var conf =  lconf();

    var opts =  conf.parse('./_test.yaml')
                .opts();
    var op = {};
    op[pathResolver("./_test.yaml")] = {invoice: 34843, date: true, "bill-to": "ben"};

    assert.deepEqual(opts, op, "opts shouldn't be "+JSON.stringify(opts));

    var opts2 = conf.opts();
    assert.deepEqual(opts2, {}, "opts2 shouldn't be "+JSON.stringify(opts2));
  });

  it('should support reuse after opts()', function() {
    var conf =  lconf();

    var opts =  conf.parse('./_test.yaml')
                .opts();

    var op = {};
    op[pathResolver("./_test.yaml")] = {invoice: 34843, date: true, "bill-to": "ben"};
    var op2 = {};
    op2[pathResolver("./_test.json")] = {invoice: 34843, date: false, "bill-to": "greenier"};

    assert.deepEqual(opts, op, "opts shouldn't be "+JSON.stringify(opts));

    var opts2 = conf.parse('./_test.json').opts();
    assert.deepEqual(opts2, op2, "opts2 shouldn't be "+JSON.stringify(opts2));
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

  it('shouldn\'t throw if file has unsupported extension, and suppress is used', function() {
    var conf = lconf();
    assert.doesNotThrow(function() {
      conf.suppress().parse("nonsense.pie").opts();
    }, "shouldn't throw exception");
  });

  it('should support directories', function() {
    var conf =  lconf();

    var opts =  conf.parse('./_dir/')
                .opts();

    var op3 = {};
    op3[pathResolver("./_dir/_test.js")] = {invoice: 83, date: false, "bill-to": "ben", "bool":true};
    op3[pathResolver("./_dir/_test.json")] = {invoice: 34843, date: false, "bill-to": "greenier", "bool":true};


    assert.equal(typeof(opts), "object", "opts shouldn't be type: "+typeof(opts));
    assert.deepEqual(opts, op3, "opts shouldn't be "+JSON.stringify(opts));
  });

  it('should support directories with regex', function() {
    var conf =  lconf();

    var opts =  conf.parse('./_dir/', /.?\.js$/)
                .opts();

    var op3 = {};
    op3[pathResolver("./_dir/_test.js")] = {invoice: 83, date: false, "bill-to": "ben", "bool":true};


    assert.equal(typeof(opts), "object", "opts shouldn't be type: "+typeof(opts));
    assert.deepEqual(opts, op3, "opts shouldn't be "+JSON.stringify(opts));
  });

  after(function() {
    fs.unlinkSync('_test.yaml');
    fs.unlinkSync('_test.json');
    fs.unlinkSync('_test.js');

    fs.unlinkSync('./_dir/_test.js');
    fs.unlinkSync('./_dir/_test.json');
    fs.rmdirSync('./_dir');
  });
});