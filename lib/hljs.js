var hljs      =  require('highlight.js')
  , fs        =  require('fs')
  , path      =  require('path')
  , log       =  require('npmlog')
  , common    =  require('./common')
  , languages =  require('./hljs-languages')
  , header =
      '<!DOCTYPE>' +
      '<head>' +
        '<link rel="stylesheet" href="./' + common.StylesFolderName + '/magula.css" ' + 
            'type="text/css" media="screen" charset="utf-8">' +
      '</head>' +
      '<body><pre><code>'
  , footer = '</code></pre></body>'
  ;

  
module.exports = {
  
    // [Path folder, String ext,] Function cb
    getStyles   :  getStyles
    
    // Path targetDir, Function copiedStylesCb
  , copyStyles  :  copyStyles
  
    // Path: fullPath, Function highlightedCb
  , highlightFile :  highlightFile
};

function getStyles (cb) {
  support.getStyles(common.paths.hljsStyles, cb);
}

function copyStyles (tgtDir, cb) {
  support.copyStyles(common.paths.hljsStyles, tgtDir, cb);
}

function highlightFile (fullPath, highlightedCb) {
  fs.readFile(fullPath, 'utf-8', function(err, code) {
    if (err) {
      highlightedCb(err);
      return;
    }

    var ext = path.extname(fullPath).slice(1)
      , language = languages.getLanguage(ext)
      , highlighted
      ;

    try {
      if (language) {
        log.silly('hljs', 'language: %j', language);
        highlighted = hljs.highlight(language.name, code).value;
      } else {
        log.silly('hljs', 'auto detecting language');
        highlighted = hljs.highlightAuto(code).value;
      }

    } catch (err) {
      highlightedCb(err);
      return;
    }
    
    var html = wrapInPre(highlighted);
    highlightedCb(null, html);
  });
}

function wrapInPre(code) {
  var highlightStart = '<div class="highlight"><pre>'
    , highlightEnd   = '</pre></div>'
    ;

    return highlightStart + code + highlightEnd;
}
