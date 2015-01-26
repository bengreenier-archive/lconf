var yaml = require('js-yaml'),
    fs = require('fs'),
    path = require('path'),
    pathResolver = require('path-resolver').sync;


// returns a constructor for a parser
module.exports = function Parser() {
  var self = this;
  
  self._suppress = false;
  self._paths = [];

  self.suppress = function(bool) {
    self._suppress = bool || true;

    return self;
  };

  self.parse = function(path) {
    // Note: currently this means we only support absolute paths
    // no regex, must include ./ if same dir, no directory names
    self._paths.push(path);

    return self;
  };

  // Does the actual file parsing
  function load(file) {
    if (path.extname(file) === ".yaml" || path.extname(file) === ".yml") {
      return yaml.safeLoad(fs.readFileSync(file));

    } else if (path.extname(file) === ".json") {
      return require(file);

    } else if (path.extname(file) === ".js") {
      var obj = require(file);

      if (typeof(obj) !== "object") {
        throw {error: "needs to export object, not "+typeof(obj), file: file};

      } else {
        return obj;
      }
    } else {
      throw {error: path+" has invalid extension: "+path.extname(file)};
    }
  }

  self.opts = function() {
    // Do parsing
    var res = {}, except = [];

    for (var i = 0 ; i < self._paths.length ; i ++) {
      try {
        var path = self._paths[i];

        // use pathResolver to normalize/check existence
        if ((path = pathResolver(path)) !== false) {
          res[path] = load(path);  
        } else {
          throw new Error("path "+self._paths[i]+" is invalid");
        }
      } catch (e) {
        except.push(e);
      }
    }

    // Clear self._paths; new calls shouldn't include already opts() objects
    self._paths = [];

    // Throw if we have anything and !suppressed
    if (!self._suppress && except.length > 0) {
      throw {error: "aggregate exception", inner: except};
    }

    // Doesn't chain, returns resultant parsed config
    return res;
  };
};