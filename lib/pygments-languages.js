var fs = require('fs')
  , _ = require('underscore')
  , common = require('./common')
  , languages = { }
  ;

(function initLanguages() {
  var json = JSON.parse(fs.readFileSync(common.paths.pygmentsLexersJson))
    , names = Object.keys(json)
    ;

  names.forEach(function (name) {
    _(json[name].extensions)
        // only accept true extensions e.g., *.js, but not .vim
        .filter(function (x) { 
          return x.match(/^\*\.+/); 
        })
        // remove '*.'
        .map(function (x) {
          return x.substr(2);
        })
        // in case of duplicate extension prefer shorter names e.g, 'JavaScript' over 'JavaScript+Smarty'
        .filter(function (x) {
          return !languages[x] || languages[x].length > name.length;
        })
        .forEach(function (x) {
          languages[x] = name.toLowerCase();
        });
  });
}) ();

module.exports.getLanguage = function(ext) {
  // accept *.ext, .ext and ext
  var normalizedExt = ext.replace(/^\*/,'').replace(/^\./,'');

  return languages[normalizedExt] || null; 
};
