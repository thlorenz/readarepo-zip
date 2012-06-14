var markdown =  require('markdown').markdown
  , fs = require('fs')
  , hljs = require('highlight.js')
  , codeBlockStandIn = 'aaaaBBBBzzzzCODEBLOCKSTANDINzzzzBBBBaaaa'
  , header = 
        '<!DOCTYPE>' +
        '<head>' +
            '<link rel="stylesheet" href="../../samples/magula.css" type="text/css" media="screen" charset="utf-8">' +
        '</head>' +
        '<body>'
  , footer = '</body>'
  ;

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

    // default markdown code highligher
    function highlight(code, language) { 
        var knownLanguage = language && hljs.LANGUAGES.hasOwnProperty(language.toLowerCase())
          , highlighted   = knownLanguage ?
              hljs.highlight(language, code).value :
              hljs.highlightAuto(code).value
          ;

        return '<pre><code>' + highlighted + '</code></pre>'; 
    }

    opts           =  opts           || { };
    opts.dialect   =  opts.dialect   || 'Gruber';
    opts.highlight =  opts.highlight || highlight;
    opts.wrap      =  opts.wrap      || function (content) { return header + content + footer; };
    opts.toHTML    =  opts.toHTML    || markdown.toHTML;

    function highlightBlock (surroundedBlock) {

        // Determine language and code block
        var lines = surroundedBlock.split('\n')
        
          // extract language for multiline codeblocks e.g., (```` javascript) from first line
          , language = lines.length > 1 ? lines.shift().replace(/^[` ]+/, '') : null
      
          // Join lines back together and remove all (`) symbols
          , block = lines.join('\n').replace(/`+/g, '')
          ;

        return opts.highlight(block, language);
    }

    function replaceBlockWithStandIn (surroundedBlock) {
        var position         =  content.indexOf(surroundedBlock)
          , beforeBlock      =  content.substr(0, position)
          , afterBlock       =  content.substr(position + surroundedBlock.length)
          ;

        // Not the most performant way to replace a substring, but it will do for now
        content = beforeBlock + codeBlockStandIn + afterBlock;
    }

    // Steps
    
    var regex = /^[`]+([^`]+?)[`]+/mg
      , matches = content.match(regex)
      , highlightedBlocks = []
      ;

    matches
        .forEach(function(surroundedBlock) {
            var highlightedBlock = highlightBlock(surroundedBlock);
            highlightedBlocks.push(highlightedBlock);

            replaceBlockWithStandIn(surroundedBlock);
        });

    // Convert remaining markdown
    content =  opts.toHTML(content, opts.dialect);

    // Replace standins with highlighted code
    highlightedBlocks
        .forEach(function(highlightedBlock) {
            var position      =  content.indexOf(codeBlockStandIn)
              , beforeStandIn =  content.substr(0, position)
              , afterStandIn  =  content.substr(position + codeBlockStandIn.length)
              ;

            content = beforeStandIn + highlightedBlock + afterStandIn;
        });

    return opts.wrap(content);
};

/*
console.log('\033[2J');
var markd = fs.readFileSync('./tmp/node-optimist/README.markdown')
  , converted = convertMarkdown(markd.toString())
  ;

console.log(converted.toString());
*/
