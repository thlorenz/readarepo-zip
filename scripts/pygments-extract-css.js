var child_process   =  require('child_process')
  , spawn           =  child_process.spawn
  , path            =  require('path')
  , fsrec           =  require('fsrec')
  , pygments        =  require('../lib/pygments')
  , paths           =  require('../lib/common').paths
  , pygmentize      =  path.join(paths.pygments, 'pygmentize')
  ;

pygments.getStyles(paths.pygmentsStylesSource, '.py', function (styles) {

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
