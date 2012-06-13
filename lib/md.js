var markdown =  require('markdown').markdown
  , fs = require('fs');

exports.convertMarkdown = function (fullSourcePath, fullTargetPath, opts, convertedMarkdownCb) {
    opts = opts || { };
    opts.dialect = opts.dialect || 'Gruber';

    var command = 'markdown'
      , buffer = ''
      , errors = []
      , stream = fs.createReadStream(fullSourcePath);

    stream.resume();
    stream.setEncoding('utf8');

    console.log('converting markdown: ', fullSourcePath);

    stream.on('error', function(err) {
        console.log('%s [ERROR]: %s', command, err.toString());
        errors.push(err);
    });

    stream.on('data', function(data) {
        buffer += data;
    });
    
    stream.on('end', function() {
        if (errors.length > 0) {
            convertedMarkdownCb(errors);
            return;
        }

        var html = markdown.toHTML(buffer, opts.dialect);

        fs.writeFile(fullTargetPath, html, convertedMarkdownCb);
    });
};
