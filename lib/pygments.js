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
  , paths         =  common.paths
  , highlightQueue
  ;

module.exports = {
  
    // [Path folder, String ext,] Function cb
    getStyles   :  getStyles
    
    // Path sourceDir, Path targetDir, Function copiedStylesCb
  , copyStyles  :  copyStyles
  
    // String: soure, Object language, Function highlightedCb
  , highlight   :  highlight
  
    // Path: fullPath, Function highlightedCb
  , highlightFile :  highlightFile

    // String wrapped
  , unwrapFromPre :  unwrapFromPre
};
// API
function getStyles (folder, ext, cb) {

  if (_.isFunction(folder)) {
    cb = folder;
    folder  = common.paths.pygmentsStyles;
    ext = '.css';
  } else if (_.isFunction(ext)) {
    cb = ext;
    ext = '.css' ;
  }

  fsrec.readdir({ 
      root: folder
    , fileFilter: function(fi) { 
          return path.extname(fi.name) === ext && fi.name.indexOf('__') === -1;
        } 
      }
    , function (err, res) {
      if (err) {
        error.error('getting styles', err);
        cb([]);
        return;
      }

      cb(
        res.files.map(function(fi) { 
          var extlength = path.extname(fi.name).length;
          return fi.name.substr(0, fi.name.length - extlength);
        })
      );
      }
  );
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

function copyStyles(sourceDir, targetDir, copiedStylesCb) {

  mkdirp(targetDir, function (err) {
    if (err) {
      copiedStylesCb(err);
      return;
    }

    fsrec.readdir({
        root: sourceDir
      , fileFilter: '*.css' }
      , function (err, res) {
        if (err) {
          copiedStylesCb(err);
          return;
        }

        var pumping = res.files.length;
        log.verbose('copying styles', pumping);

        res.files.forEach(function (fi) {
          var source = fs.createReadStream(fi.fullPath)
            , target = fs.createWriteStream(path.join(targetDir, fi.name))
            ;

          util.pump(source, target, function (err) {
            if (err) log.error('copying', err);
            if (--pumping === 0) copiedStylesCb(err);
          });
          
        });
      });
  });
}
