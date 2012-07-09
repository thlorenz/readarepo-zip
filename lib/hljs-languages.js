languages = {
    'js'     :  { name :  'javascript'}
  , 'coffee' :  { name :  'coffeescript' }
  , 'json'   :  { name :  'json' }
  , 'as'     :  { name :  'actionscript' }
  , 'sh'     :  { name :  'bash' }
  , 'hs'     :  { name :  'haskell' }
  , 'py'     :  { name :  'python' }
  , 'rb'     :  { name :  'ruby' }
};

module.exports.getLanguage = function(ext) {
  // accept *.ext, .ext and ext
  var normalizedExt = ext.replace(/^\*/,'').replace(/^\./,'');

  return languages[normalizedExt] || null; 
};


