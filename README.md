# lconf [![Build Status](https://travis-ci.org/bengreenier/lconf.svg)](https://travis-ci.org/bengreenier/lconf)
parse local configuration files of various types. __currently supported filetypes__: `json`,`yaml`,`yml`,`js` (must `module.exports = {};`)

# api

lconf supports three methods:

  + __parse(file:string, [regex:RegExp])__:  
    parses a configuration file located at `file`. note: if `file` is relative, it will be resolved from `process.cwd()`. if `file` is a directory, all
    files inside the directory will be included. if `regex` is given, `file` (if actual file) or all files in directory (if `file` is a directory) will
    be compared against regex, and added if `regex.test(filePath)` returns `true`.

  + __suppress(bool:boolean[default=true])__:  
    toggles throwing of exceptions when parsing. using `suppress()` will prevent throwing of errors.

  + __opts()__:  
    does the actual parse, and throws errors if there are any, and we aren't `suppress()`-ed.


these methods can be chained together:

```
var lconf = require('lconf');

// parse multiple configuration files
var config = lconf().parse('./config.yaml').parse('./config.json').opts();
```

the resulting object will look like:

```
{
  "./config.yaml": {...},
  "./config.json": {...}
}
```

__If you want to smash configuration variables into one object, see [bengreenier/hulksmash](https://github.com/bengreenier/hulksmash)__.

# examples

parse some config files that may or may not be present:

```
var lconf = require('lconf');

// parse multiple configuration files
var config = lconf()
              .parse('./idk.yaml')
              .parse('./if.json')
              .parse('./these.json')
              .parse('./are.json')
              .parse('./present.js')
              .suppress()
              .opts();

// could check config object keys to see what succeeded
```

reuse parsing instance:

```
var lconf = require('lconf');

// parse multiple configuration files
var parser = lconf();

var config = parser
              .parse('./config.yaml')
              .parse('./config.json')
              .opts();

var settings = parser
              .parse('./settings.yaml')
              .parse('./settings.json')
              .opts();

// config will have two keys (one for each .parse() filename)
// settings will have two as well.
// each call to .opts() clears previously parsed data
```
