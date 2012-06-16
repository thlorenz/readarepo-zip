var hljs   =  require('highlight.js')
  , fs     =  require('fs')
  , path   =  require('path')
  , _      =  require('underscore')
  , common =  require('./common')
  , header =
        '<!DOCTYPE>' +
        '<head>' +
            '<link rel="stylesheet" href="./' + common.StylesFolderName + '/magula.css" ' + 
                  'type="text/css" media="screen" charset="utf-8">' +
        '</head>' +
        '<body><pre><code>'
  , footer = '</code></pre></body>'
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

