/*jshint asi:true */

var md                =  require('../lib/md.js')
  , highlightedCode   =  '<highlighted>believe me it is</highlighted>'
  , onelineBlock      =  'code to highlight'
  , otherOnelineBlock =  'other code to highlight'
  , multilineBlock    =  'code\nto\nhighlight'
  ;
function getOpts () {
  return { 
      toHTML    :  function (content) { return content; }
    , blocks    :  []
    , highlight :  function (block) {
        this.blocks.push(block); 
        return highlightedCode;
      } 
  };
}

describe('highlighting unnamed `codeblock` on one line', function () {

  var content = '# Header\nSome Explanation\n`' + onelineBlock + '`\nMore Content'
    , opts = getOpts()
    , res = md.convertMarkdown(content, opts)
    ;


  it('calls highlighter with codeblock', function () {
    opts.blocks[0].should.equal(onelineBlock);
  })
});

describe('highlighting unnamed ````codeblock```` on one line', function () {

  var content = '# Header\nSome Explanation\n````' + onelineBlock + '````\nMore Content'
    , opts = getOpts()
    ;

  md.convertMarkdown(content, opts);

  it('calls highlighter with codeblock', function () {
    opts.blocks[0].should.equal(onelineBlock);
  })
});

describe('highlighting two unnamed `codeblock`s each on one line', function () {

  var content = '# Header\nSome Explanation\n`' + onelineBlock + '`\nMore Content\n`' + otherOnelineBlock + '`\nThe End'
    , opts = getOpts()
    ;

  md.convertMarkdown(content, opts);

  it('calls highlighter with first codeblock', function () {
    opts.blocks[0].should.equal(onelineBlock);
  })

  it('calls highlighter with second codeblock', function () {
    opts.blocks[1].should.equal(otherOnelineBlock);
  })
  
});
