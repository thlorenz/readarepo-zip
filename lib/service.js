var fs      =  require('fs')
  , fsrec   =  require('fsrec')
  , mkdirp  =  require('mkdirp')
  , path    =  require('path')
  , step    =  require('step')
  , sh      =  require('./sh')
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

function resolveFullRoot () { 
    var that = this;
    fs.realpath (that.data.rootPath, function (err, realPath) { 
        if (err) console.log('Error when resolving full root: ', err);

        that.data.fullRootPath = realPath; 
        that(); 
    });
}

function resolveFullTarget () { 
    var that = this;
    fs.realpath (that.data.targetPath, function (err, realPath) { 
        if (err) console.log('Error when resolving full target: ', err);

        that.data.fullTargetPath = realPath; 
        that();
    });
}


// API 
module.exports.cloneGitRepository = function (url, opts, clonedGitRepoCb) {
    opts =  opts || { };
    function init() {
        this.data = {
            url        :  url 
          , targetPath :  opts.targetPath      || './tmp'
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
        this.data.clonedRepoPath = path.join(this.data.fullTargetPath, this.data.repoName);
        mkdirp(this.data.fullTargetPath, this);
    }
    
    function cloneRepo() {
        sh.gitClone(this.data.url, this.data.clonedRepoPath, this);
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
        that.data.entryInfos.files.forEach(function(fi) {

            var tgt = path.join(that.data.fullTargetPath, fi.path) + '.html';

            // TODO: Use markdown parser for md files and copy files that couldn't be highlighted
            // TODO: pass in style information with opts and choose different highlighter in the future (maybe)
            sh.pygmentize(fi.fullPath, tgt, null, function(err) {
                if (err) {
                    console.log('Error when pygmentizing:', fi.fullPath);
                    console.log(err);
                } 
                if (--pending === 0) that();
            });
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

/*
cloneGitRepository('git://github.com/thlorenz/doctoc.git', null, function(err, res) {
    var convertedPath = res.clonedRepoPath + '_converted';
    fs.mkdirSync(convertedPath);
    var opts = { 
        directoryFilter: [ '!.git', '!node_modules' ]
      , targetPath: convertedPath
    };
    convertFolder(res.clonedRepoPath, opts, function() {
        console.log('done');
    });
});
*/
