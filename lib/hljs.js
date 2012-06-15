var hljs      =  require('highlight.js')
  , fs        =  require('fs')
  , path      =  require('path')
  , _         =  require('underscore')
  , constants =  require('./constants')
  , header = 
        '<!DOCTYPE>' +
        '<head>' +
            '<link rel="stylesheet" href="./' + constants.StylesFolderName + '/magula.css" ' + 
                  'type="text/css" media="screen" charset="utf-8">' +
        '</head>' +
        '<body><pre><code>'
  , footer = '</code></pre></body>'
  , languages = [
         { ext: 'js'     ,  name: 'javascript'}
      ,  { ext: 'coffee' ,  name: 'coffeescript' }
      ,  { ext: 'json'   ,  name: 'json' }
      ,  { ext: 'as'     ,  name: 'actionscript' }
      ,  { ext: 'sh'     ,  name: 'bash' }
      ,  { ext: 'hs'     ,  name: 'haskell' }
      ,  { ext: 'py'     ,  name: 'python' }
      ,  { ext: 'rb'     ,  name: 'ruby' }
  ]
  ;


module.exports.highlight = function (sourcePath, targetPath, highlightedCb) {
    fs.readFile(sourcePath, 'utf-8', function(err, code) {
        if (err) {
            highlightedCb(err);
            return;
        }

        var ext = path.extname(sourcePath).slice(1)
          , language = _(languages).find(function(x) { return x.ext === ext; })
          , highlighted
          ;

        console.log('Extension: ', ext);
        try {

            if (language) {
                console.log('\tusing', language);
                highlighted = hljs.highlight(language.name, code).value;
            } else {
                highlighted = hljs.highlightAuto(code).value;
            }

        } catch (err) {
            highlightedCb(err);
            return;
        }

        fs.writeFile(targetPath, header + highlighted + footer, highlightedCb);
    });
};

