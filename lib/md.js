var markdown =  require('markdown').markdown
  , fs = require('fs');

exports.convertMarkdownFile = function (fullSourcePath, fullTargetPath, opts, convertedMarkdownCb) {
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

        var html = convertMarkdown (buffer, opts);
        fs.writeFile(fullTargetPath, html, convertedMarkdownCb);
    });
};

exports.convertMarkdown = convertMarkdown = function (content, opts) {
    opts           =  opts           || { };
    opts.dialect   =  opts.dialect   || 'Gruber';
    opts.highlight =  opts.highlight || function (code) { return '`' + code + '`'; };
    opts.toHTML    =  opts.toHTML    || markdown.toHTML;

    var regex = /[`]+([^`]+)[`]/g
      , matches = content.match(regex)
      ;

      matches
        .forEach(function(surroundedBlock) {
            var block            =  surroundedBlock.replace(/`+/g,'')
              , highlightedBlock =  opts.highlight(block)
              , position         =  content.indexOf(surroundedBlock)
              ;

            // Not the most performant way to replace a substring, but it will do for now
            content = content.substr(0, position) + 
                highlightedBlock +
                content.substr(position + surroundedBlock.length);

        });

    return opts.toHTML(content, opts.dialect);
};
