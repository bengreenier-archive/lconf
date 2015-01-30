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

  self.parse = function(fpath, regex) {
    var paths;
    
    if (fs.existsSync(fpath) && fs.statSync(fpath).isDirectory()) {
      paths = fs.readdirSync(fpath);
      for (var i = 0 ; i < paths.length; i++) {
        paths[i] = fpath+path.sep+paths[i];
      }
    } else {
      paths = [fpath];
    }

    for (var i = 0 ; i < paths.length; i++) {
      if (regex instanceof RegExp) {
        if (regex.test(paths[i])) {
          self._paths.push(paths[i]);
        }
      } else {
        self._paths.push(paths[i]);
      }
    }
    
    return self;
  };

  // clone an object
  function clone(obj) {
    if (obj instanceof Object) {
      copy = {};
      for (var attr in obj) {
          if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
      }
      return copy;
    } else {
      return obj;
    }
  }

  // Does the actual file parsing
  function load(file) {
    if (path.extname(file) === ".yaml" || path.extname(file) === ".yml") {
      return yaml.safeLoad(fs.readFileSync(file));

    } else if (path.extname(file) === ".json") {
      var r = JSON.parse(fs.readFileSync(file));
      return r;

    } else if (path.extname(file) === ".js") {
      var obj = require(file);
      
      if (typeof(obj) !== "object") {
        throw {error: "needs to export object, not "+typeof(obj), file: file};

      } else {
        return clone(obj);
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
          if (!(path instanceof Array)) path = [path];

          for (var j = 0; j < path.length; j++) {
              res[path[j]] = load(path[j]);
          }
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