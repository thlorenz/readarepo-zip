var fs            =  require('fs')
  , path          =  require('path')
  , util          =  require('util')
  , child_process =  require('child_process')
  , spawn         =  child_process.spawn
  , handlebars    =  require('handlebars')
  , _             =  require('underscore')
  , fsrec         =  require('fsrec')
  , mkdirp        =  require('mkdirp')
  , log           =  require('npmlog')
  , common        =  require('./common')
  , paths         =  common.paths
  , templates     =  require('./templates/store')
  , pygmentize    =  path.join(paths.pygments, 'pygmentize')
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

function highlight (source, language, highlightedCb) {
  var langOpts =  ['-l', language.name ] 
    , options  =  langOpts.concat([ '-f', 'html', '-O', 'encoding=utf-8,full=false'])
    , pygments =  spawn(pygmentize, options)
    , output   = ''
    ;
  
  pygments.stderr.on('data', function(err) {
    log.error('highlighting', err);
  });

  pygments.stdout.on('data', function(res) {
    output += res;
  });

  pygments.on('exit', function () {
    highlightedCb(null, output);
  });
  
  pygments.stdin.write(source);
  pygments.stdin.end();
}

function highlightFile(fullPath, highlightedCb) {
  // TODO: detect language from FileName
  language = { name: 'javascript' };
  fs.readFile(fullPath, 'utf-8', function (err, content) {
    if (err) { highlightedCb(err); return; }

    highlight(content, language, function (err, htmlFragment) {
      if (err) { highlightedCb(err); return; }
      highlightedCb(null, htmlFragment);  
    });
  });
}

function unwrapFromPre(wrappedCode) {
  var   highlightStart = '<div class="highlight"><pre>'
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


/*
var   sourcePath = path.join(__dirname, '..', 'samples', 'doctoc', 'doctoc.js')
  , targetPath = path.join(__dirname, '..', 'tmp', 'doctoc.js.html')
  , stylesPath = path.join(__dirname, '..', 'tmp', common.StylesFolderName)
  , language = { name: 'javascript' } 
  ;

getStyles(function (styles) {
  console.log(styles);

  var html = templates.codeHtmlWrap({ styles: styles, defaultStyle: 'tango' });
  console.log(html);
});

copyStyles(paths.pygmentsStyles, stylesPath, function(err) {
  console.log('copied', err);
});

fs.readFile(sourcePath, function (err, content) {
  if (err) {
    console.log(err);
    return;
  } else {
    highlight(content, language, function (err, result) {
      if (err) { 
        console.log('Error: ', err);
        return;
      }
      console.log(result);
    });
  }
});

*/

