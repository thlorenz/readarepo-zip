var fs       =  require('fs')
  , fsrec    =  require('fsrec')
  , mkdirp   =  require('mkdirp')
  , path     =  require('path')
  , step     =  require('step')
  , sh       =  require('./sh')
  , md       =  require('./md')
  , hljs     =  require('./hljs')
  ;

// Support
function mirrorDirectories(fullRootPath, relSourcePathInfos, mirroredCb) {
    var pending = relSourcePathInfos.length;

    relSourcePathInfos
        .forEach(function(sourcePathInfo) { 
            var dir = path.join(fullRootPath, sourcePathInfo.path);
            mkdirp(dir, function(err) {
                if (err) {
                    console.log('Unable to create: ', dir);
                }
                if (--pending === 0) mirroredCb();
            });
        });
}


function didBailOnError (desc, err, onError) {
    if (err) {
        console.log('Error', desc);
        onError(err);
        return true;
    } else {
        return false;
    }
}

function resolveFullRoot (onError) { 
    var that = this;
    fs.realpath (that.data.rootPath, function (err, realPath) { 
        if (didBailOnError('when resolving full root.', err, onError || that.onError)) return;

        that.data.fullRootPath = realPath; 
        that(); 
    });
}

function resolveFullTarget (onError) { 
    var that = this;
    fs.realpath (that.data.targetPath, function (err, realPath) { 
        if (didBailOnError('when resolving full target.', err, onError || that.onError)) return;

        that.data.fullTargetPath = realPath; 
        that(); 
    });
}

// API 
module.exports.cloneGitRepository = function (url, opts, clonedGitRepoCb) {
    opts =  opts || { };

    function bailedOnError (desc, err) {
        return didBailOnError(desc, err, clonedGitRepoCb);
    }

    function init() {
        this.data = {
            url        :  url 
          , targetPath :  opts.targetPath      || './tmp'
          , onError    :  clonedGitRepoCb
        };
        console.log('initialized', this.data);
        this();
    }

    function getRepoName() {
        var base = path.basename(this.data.url)
          , ext  = path.extname(base)
          ;

        this.data.repoName = base.substr(0, base.length -  ext.length);
        this();
    }

    function prepareTargetDirectory() {
        var that = this;

        that.data.clonedRepoPath = path.join(that.data.fullTargetPath, that.data.repoName);

        mkdirp(that.data.fullTargetPath, function(err) {
            if (bailedOnError('when preparing target directory', err)) return;
            that();
        });
    }
    
    function cloneRepo() {
        var that = this;
        sh.gitClone(that.data.url, this.data.clonedRepoPath,  function(err) {
            if (bailedOnError('when cloning repository', err)) return;
            that();
        });
    }

    step(init
       , resolveFullTarget
       , getRepoName
       , prepareTargetDirectory
       , cloneRepo
       , function cloned(err) { 
            clonedGitRepoCb(err, this.data);
         }
       );
};

module.exports.convertFolder = function (rootPath, opts, convertedFolderCb) {
    opts =  opts || { };
    opts.highlighter = opts.highlighter || 'pygment';

    function isMarkdown (fileName) {
        return ['.md', '.markdown'].indexOf(path.extname(fileName)) > 0;
    }

    function init() {
        this.data = {
            rootPath        :  rootPath
          , targetPath      :  opts.targetPath      || './tmp'
          , directoryFilter :  opts.directoryFilter || undefined
          , fileFilter      :  opts.fileFilter      || undefined
        };
        this();
    }

    function getFilesToConvert() { 
        var that = this;
        fsrec.readdir( { 
              root: that.data.fullRootPath
            , directoryFilter: that.data.directoryFilter
            , fileFilter: that.data.fileFilter 
          }
          , function(err, entryInfos) {
              if (err) console.log('Errors when getting files to convert: ', err);

              that.data.entryInfos = entryInfos;
              that();
          });
    }

    function prepareTargetDirectories() {
        mirrorDirectories(this.data.fullTargetPath, this.data.entryInfos.directories, this);
    }

    function syntaxHighlightFiles () {
        var that = this;

        var pending = that.data.entryInfos.files.length;

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
                    sh.pygmentize(fi.fullPath, tgt, null, function(err) {
                        onConversionComplete('pygment', fi.fullPath, err);
                    });
                } else if (opts.highlighter === 'hljs') {
                    hljs.highlight(fi.fullPath, tgt, function(err) {
                        onConversionComplete('highlight.js', fi.fullPath, err);
                    });
                }
            }
        });
    }

    step( init
        , resolveFullRoot
        , resolveFullTarget
        , getFilesToConvert 
        , prepareTargetDirectories
        , syntaxHighlightFiles
        , convertedFolderCb
        );
};
