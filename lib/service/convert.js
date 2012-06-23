var fs        =  require('fs')
  , fsrec     =  require('fsrec')
  , mkdirp    =  require('mkdirp')
  , path      =  require('path')
  , util      =  require('util')
  , step      =  require('step')
  , md        =  require('../md')
  , hljs      =  require('../hljs')
  , pygments  =  require('../pygments')
  , templates =  require('../templates/store')
  , common    =  require('../common')
  , support   =  require('./support')
  ;

module.exports.convertFolder = function (rootPath, opts, convertedFolderCb) {
  opts =  opts || { };
  opts.highlighter = opts.highlighter || 'pygment';
  opts.pygmentsDefaultStyle = opts.pygmentsDefaultStyle || 'tango';

  function bailedOnError (desc, err) {
    return support.didBailOnError(desc, err, convertedFolderCb);
  }

  function isMarkdown (fileName) {
    return ['.md', '.markdown'].indexOf(path.extname(fileName)) > 0;
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

    this();
  }

  function getFilesToConvert() { 
    var that = this;
    fsrec.readdir( {
          root            :  that.data.fullRootPath
        , directoryFilter :  that.data.directoryFilter
        , fileFilter      :  that.data.fileFilter
        }
      , function(err, entryInfos) {
        if (err) console.log('Errors when getting files to convert: ', err);

        that.data.entryInfos = entryInfos;
        that();
      });
  }

  function prepareTargetDirectories() {
    support.mirrorDirectories(this.data.targetPath, this.data.entryInfos.directories, this);
  }

  function getStyles() {
    var that = this;
    pygments.getStyles(function (styles) {
      that.data.styles = styles;
      that();
    });
  }

  function copyStyles () {
    var that =  this
      , src  =  common.paths.pygmentsStyles
      , tgt  =  that.data.stylesTargetPath
      ;

    pygments.copyStyles(src, tgt, function (err) {
      if (bailedOnError('when copying styles', err)) return;
      that();
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
    var that = this;
    var pending = that.data.entryInfos.files.length;

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
        , defaultStyle        :  opts.pygmentsDefaultStyle
        , javascripts         :  javascripts
        , highlightedCodeHtml :  htmlFragment
      });
    }

    function onConversionComplete(kind, fullPath,  err) {
      if (err) {
        console.log('Error during %s conversion. File: %s.', kind, fullPath);
        console.log(err);
      } 
      if (--pending === 0) that();
    }

    that.data.entryInfos.files.forEach(function(fi) {

      var tgt = path.join(that.data.fullTargetPath, fi.path) + '.html';

      // TODO: Use markdown parser for md files and copy files that couldn't be highlighted
      // TODO: pass in style information with opts and choose different highlighter in the future (maybe)

      if (isMarkdown(fi.name)) {
        md.convertMarkdownFile(fi.fullPath, tgt, null, function (err) {
          onConversionComplete('markdown', fi.fullPath, err);
        });
      } else {
        if (opts.highlighter === 'pygment') {

          pygments.highlightFile(fi.fullPath, function (err, htmlFragment) {
            if (err) {
              onConversionComplete('pygment.highlight', fi.fullPath, err);
              return;
            }

            var pageHtml = getReaderCodePage(htmlFragment, tgt);
            fs.writeFile(tgt, pageHtml, function (err) {
              onConversionComplete('pygment.write', fi.fullPath, err);
            });
          });

        } else if (opts.highlighter === 'hljs') {
          hljs.highlight(fi.fullPath, tgt, function(err) {
            onConversionComplete('highlight.js', fi.fullPath, err);
          });
        }
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

/*
var root = '/Users/thlorenz/Dropboxes/Gmail/Dropbox/dev/javascript/projects/readarepo/samples/doctoc';

module.exports.convertFolder(root, { directoryFilter: ['!node_modules', '!.git'] }, function () {
  console.log('highlighted', this.data);
});
*/
