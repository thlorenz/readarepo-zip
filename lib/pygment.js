var fs            =  require('fs')
  , path          =  require('path')
  , child_process =  require('child_process')
  , spawn         =  child_process.spawn
  , common        =  require('./common')
  , pygmentize    =  path.join(__dirname, '..', '3rd', 'pygments', 'pygmentize')
  ;

var highlightStart = '<div class="highlight"><pre>'
  , highlightEnd   = '</pre></div>'
  ;


function highlight (source, language, highlightedCb) {
    var pygments = spawn(pygmentize, ['-l', language.name, '-f', 'html', '-O', 'encoding=utf-8,full=true,noclobber_cssfile,cssfile=doctoc.css'])  
      , output   = ''
      ;
    
    pygments.stderr.on('data', function(err) {
        console.log(err);
    });

    pygments.stdout.on('data', function(res) {
        output += res;
    });

    pygments.on('exit', function () {
        output = output
            .replace(highlightStart, '')
            .replace(highlightEnd, '');

        highlightedCb(null, output);
    });
    
    pygments.stdin.write(source);
    pygments.stdin.end();
}

var sourcePath = path.join(__dirname, '..', 'samples', 'doctoc', 'doctoc.js')
  , targetPath = path.join(__dirname, '..', 'tmp', 'doctoc.js.html')
  , language = { name: 'javascript' } 
  ;

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
