var nsh       =  require('node-syntaxhighlighter')
  , fs        =  require('fs')
  , path      =  require('path')
  , log       =  require('npmlog')
  , common    =  require('./common')
  , mkdirp    = require('mkdirp')
  , styles    =  nsh.getStyles()
  ;


module.exports = {

    // [Path folder, String ext,] Function cb
    getStyles   :  getStyles
    
    // Path targetDir, Function copiedStylesCb
  , copyStyles  :  copyStyles

    // Path: fullPath, Function highlightedCb
  , highlightFile :  highlightFile

  , defaultStyle : 'default'

};

function getStyles (cb) {
  var styleNames = Object.keys(styles).map(function (key) {
    return styles[key].name;  
  });

  cb(styleNames);
}

function copyStyles(tgtDir, copiedStylesCb) {
  log.info('syntaxhighlighter', 'Copying styles to: %s', tgtDir);
  mkdirp(tgtDir, function (err) {
    if (err) {
      copiedStylesCb(err);
      return;
    }

    nsh.copyStyles(tgtDir, copiedStylesCb);
  });  
}

function highlightFile (fullPath, highlightedCb) {
  fs.readFile(fullPath, 'utf-8', function(err, code) {
    if (err) {
      highlightedCb(err);
      return;
    }

    var ext = path.extname(fullPath).slice(1)
      , language = nsh.getLanguage(ext)
      , highlighted
      ;

    try {
      if (language) {
        highlighted = nsh.highlight(code, language);
      } else {
        log.silly('syntaxhighlighter', 'unknown language');

        if (ext.length > 0) {
          highlighted = nsh.highlight( code, nsh.getLanguage('text') );
        } else {
          log.silly('syntaxhighlighter', 'no extension - assuming is binary, not highlighting');

          highlighted = '<p>This file was not highlighted because SyntaxHighlighter did not know its type.</p>';
        }
      }

    } catch (err) {
      highlightedCb(err);
      return;
    }
    
    highlightedCb(null, highlighted);
  });
}
