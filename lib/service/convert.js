var fs        =  require('fs')
  , readdirp  =  require('readdirp')
  , mkdirp    =  require('mkdirp')
  , path      =  require('path')
  , util      =  require('util')
  , step      =  require('step')
  , md        =  require('../md')
  , log       =  require('npmlog')
  , templates =  require('../templates/store')
  , common    =  require('../common')
  , support   =  require('./support')
  ;

module.exports.convertFolder = function (rootPath, opts, convertedFolderCb) {
  opts =  opts || { defaultStyle: undefined };
  opts.highlighter = opts.highlighter || 'pygments';

  function bailedOnError (desc, err) {
    return support.didBailOnError(desc, err, convertedFolderCb);
  }

  function isMarkdown (fileName) {
    return ['.md', '.markdown'].indexOf(path.extname(fileName)) >= 0;
  }

  function init() {
    var targetPath = opts.targetPath || path.join(common.paths.root, 'tmp');

    this.data = {
        rootPath              :  rootPath
      , targetPath            :  targetPath
      , directoryFilter       :  opts.directoryFilter || undefined
      , fileFilter            :  opts.fileFilter      || undefined
      , stylesTargetPath      :  path.join(targetPath, common.reader.paths.styles)
      , javascriptsTargetPath :  path.join(targetPath, common.reader.paths.javascripts)
      , javascripts           :  []
    };

    // resolve highlighter to use
    switch(opts.highlighter) {
      case 'pygments':
        this.data.highlighter = require('../pygments');
        break;
      case 'hljs':
        this.data.highlighter = require('../hljs');
        break;
      case 'sh':
      case 'syntaxhighlighter':
        this.data.highlighter = require('../syntaxhighlighter');
        break;
      default:
        throw new Error('no highlighter specified');
    }

    this();
  }

  function getFilesToConvert() { 
    var that = this;
    readdirp( {
          root            :  that.data.fullRootPath
        , directoryFilter :  that.data.directoryFilter
        , fileFilter      :  that.data.fileFilter
        }
      , function(err, entryInfos) {
        if (err) log.error('conversion', 'Errors when getting files to convert: ', err);

        that.data.entryInfos = entryInfos;
        that();
      });
  }

  function prepareTargetDirectories() {
    support.mirrorDirectories(this.data.targetPath, this.data.entryInfos.directories, this);
  }

  function getStyles() {
    var that = this;
    that.data.highlighter.getStyles(function (styles) {
      that.data.styles = styles;
      that();
    });
  }

  function copyStyles () {
    var that =  this
      , tgt  =  that.data.stylesTargetPath
      ;

    that.data.highlighter.copyStyles(tgt, function (err) {
      if (bailedOnError('when copying styles', err)) return;

      md.copyDefaultStyle(tgt, function (err) {
        if (bailedOnError('when copying markdown style', err)) return;
        that();
      });
    });
  }

  function copyJavascripts () {
    var that = this
      , src  = common.reader.paths.javascriptsSource
      , tgt  = that.data.javascriptsTargetPath
      ;

    mkdirp(tgt, function (err) {

      if (bailedOnError('creating javascripts folder', err)) return;

      fs.readdir(src, function (err, files) {
        if (bailedOnError('reading javascripts files')) return;

        var pumping = files.length;
        files.forEach(function (file) {

          var sourceFilePath =  path.join(src, file)
            , targetFilePath =  path.join(tgt, file)
            , srcStream      =  fs.createReadStream(sourceFilePath)
            , tgtStream      =  fs.createWriteStream(targetFilePath)
            ;

          util.pump(srcStream, tgtStream, function (err) {
            if (bailedOnError('copying ' + sourceFilePath + ' to ' + targetFilePath, err)) return; 

            that.data.javascripts.push(path.basename(targetFilePath)); 
            if (--pumping === 0) that();
          });
        });
      });
    });
  }

  function syntaxHighlightFiles () {
    var that         =  this
      , markdownOpts =  { wrap: function (x) { return x; /* don't wrap */ } }
      , pending      =  that.data.entryInfos.files.length;

    function getReaderCodePage(htmlFragment, targetFilePath) {

      var targetParentDir    =  path.dirname(targetFilePath)
        , relStylesPath      =  path.relative(targetParentDir, that.data.stylesTargetPath)
        , relJavascriptsPath =  path.relative(targetParentDir, that.data.javascriptsTargetPath)
        ;

      var javascripts = that.data.javascripts.map(function (fileName) {
        return path.join(relJavascriptsPath, fileName); 
      });

      return templates.readerCodePage({ 
          styles              :  that.data.styles
        , stylesPath          :  relStylesPath
        , defaultStyle        :  opts.defaultStyle || that.data.highlighter.defaultStyle
        , javascripts         :  javascripts
        , highlightedCodeHtml :  htmlFragment
      });
    }

    function getReaderMarkdownPage(htmlFragment, targetFilePath) {

      var targetParentDir    =  path.dirname(targetFilePath)
        , relStylesPath      =  path.relative(targetParentDir, that.data.stylesTargetPath)
        ;

      return templates.readerMarkdownPage({ 
          stylesPath   :  relStylesPath
        , defaultStyle :  md.defaultStyleName
        , markdownHtml :  htmlFragment
      });
    }

    function onConversionComplete(kind, fullPath,  err) {
      if (err) {
        log.error('conversion', 'Error during %s conversion. File: %s.', kind, fullPath);
        log.error('conversion', err);
      } 
      if (--pending === 0) that();
    }

    that.data.entryInfos.files.forEach(function(fi) {

      var tgt = path.join(that.data.fullTargetPath, fi.path) + '.html';

      if (isMarkdown(fi.name)) {
        log.silly('markdown', fi.name);

        md.convertMarkdownFile(fi.fullPath, markdownOpts, function (err, htmlFragment) {
          if (err) {
            onConversionComplete('markdown', fi.fullPath, err);
            return;
          }

          var pageHtml = getReaderMarkdownPage(htmlFragment, tgt);
          fs.writeFile(tgt, pageHtml, function (err) {
            onConversionComplete('markdown.write', fi.fullPath, err);
          });
        });
      } else {
        that.data.highlighter.highlightFile(fi.fullPath, function (err, htmlFragment) {
          if (err) {
            onConversionComplete('highlight', fi.fullPath, err);
            return;
          }

          var pageHtml = getReaderCodePage(htmlFragment, tgt);
          fs.writeFile(tgt, pageHtml, function (err) {
            onConversionComplete('write', fi.fullPath, err);
          });

        });
      }
    });
  }
  
  step( 
      init
    , support.resolveFullRoot
    , support.resolveFullTarget
    , copyJavascripts
    , getFilesToConvert 
    , prepareTargetDirectories
    , getStyles
    , copyStyles
    , syntaxHighlightFiles
    , convertedFolderCb
    );
};
