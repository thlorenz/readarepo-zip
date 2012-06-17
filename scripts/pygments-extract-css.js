var child_process   =  require('child_process')
  , spawn           =  child_process.spawn
  , path            =  require('path')
  , fsrec           =  require('fsrec')
  , paths           =  require('../lib/common').paths
  , pygmentize      =  path.join(paths.pygments, 'pygmentize')
  ;

function getStyles (folder, cb) {
   fsrec.readdir({ 
        root: folder
      , fileFilter: function(fi) { 
                return path.extname(fi.name) === '.py' && fi.name.indexOf('__') === -1;
            } 
        }
      , function (err, res) {
            if (err) {
                console.error('Error: ', err);
                cb([]);
                return;
            }

            cb(
                res.files.map(function(fi) { 
                    var extlength = path.extname(fi.name).length;
                    return fi.name.substr(0, fi.name.length - extlength);
                })
            );
       });
}

getStyles(paths.pygmentsStylesSource, function (styles) {

    var pending = styles.length
      , opts = 'encoding=utf-8,full=true,noclobber_cssfile'
      ;


    styles.forEach(function (style) {
        var cssFilePath = path.join(paths.pygmentsStyles, style + '.css') 
          , fullOpts = opts + 
              ',style='     + style +
              ',cssfile='   + cssFilePath
          , output
          ;

        var pygments = spawn(pygmentize, ['-l', 'javascript', '-f', 'html', '-O', fullOpts]);

        pygments.stderr.on('data', function(err) {
            console.error(err);
        });

        pygments.stdout.on('data', function(res) {
            console.log(res.toString());
        });

        pygments.on('exit', function () {
            if (--pending === 0) console.log('done');
        });
    
        pygments.stdin.write('var a = 3;');
        pygments.stdin.end();
    });
});
