var fs            =  require('fs')
  , path          =  require('path')
  , util          =  require('util')
  , child_process =  require('child_process')
  , handlebars    =  require('handlebars')
  , _             =  require('underscore')
  , fsrec         =  require('fsrec')
  , mkdirp        =  require('mkdirp')
  , log           =  require('npmlog')
  , queue         =  require('minimal-queue')
  , common        =  require('./common')
  , languages     =  require('./pygments-languages')
  , templates     =  require('./templates/store')
  , pygsClient    =  require('../highlight/pygments/server/pygments-client')
  , support       =  require('./service/support')
  , paths         =  common.paths
  , highlightQueue
  ;

module.exports = {
  
    // [Path folder, String ext,] Function cb
    getStyles   :  getStyles
    
    // Path targetDir, Function copiedStylesCb
  , copyStyles  :  copyStyles
  
    // Object opts {String: soure, String language}, Function highlightedCb
  , highlight   :  highlight
  
    // Path: fullPath, Function highlightedCb
  , highlightFile :  highlightFile

  , defaultStyle : 'tango'

    // String wrapped
  , unwrapFromPre :  unwrapFromPre
};
      
function getStyles (cb) {
  support.getStyles(common.paths.pygmentsStyles, cb);
}

function copyStyles (tgtDir, cb) {
  support.copyStyles(common.paths.pygmentsStyles, tgtDir, cb);
}

function highlight (opts, highlightedCb) {
  var req = _.extend(opts, {
          action    :  'highlight'
        , outformat :  'html'
        , encoding  :  'utf-8'
      });
     
    pygsClient.highlight(req, function (err, res) {
      highlightedCb(err, res);
    });
}

// HighlightSample:
/*
highlight({
        fullPath: 'some path'
      , language: 'js'
      , code:     'var a = 4 + 5;'
    }
  , function (err, res) {
      console.log('Error: %s\nResult: %s', err, res);
  });
*/

(function initHighlightFileQueue () {
  highlightQueue = queue.up(function (fullPath, language, highlightFinished) {
      var self = this;

      log.silly('highlighting file', { path: fullPath, language: language });

      fs.readFile(fullPath, 'utf-8', function (err, content) {
        if (err) { 
          highlightFinished(err, null);
          self.done();
          return; 
        }

        var opts = {
            fullPath :  fullPath
          , language :  language
          , code     :  content
        };

        highlight(opts, function (err, htmlFragment) {
          if (err) { 
            highlightFinished(err, null);
            self.done();
            return; 
          }

          highlightFinished(null, htmlFragment);
            self.done();
        });
      });
  });

  highlightQueue.concurrency = 100;
  highlightQueue.allDone = function () {
    log.verbose('all queued higlights finished');
  };

}) ();


function highlightFile(fullPath, highlightedCb) {
  var ext = path.extname(fullPath)
    , language = languages.getLanguage(ext)
    ;

  if (language) {
    highlightQueue.enqueue(fullPath, language, highlightedCb);
  } else {
    log.silly('unknown extension', ext);
    highlightedCb(null, '<p>This file was not processed because the file type was unknown.</p>');
  }
}

function unwrapFromPre(wrappedCode) {
  var highlightStart = '<div class="highlight"><pre>'
    , highlightEnd   = '</pre></div>'
    ;

  return wrappedCode
    .replace(highlightStart, '')
    .replace(highlightEnd, '');
}

