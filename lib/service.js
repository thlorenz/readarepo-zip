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

// API 
function convertGitRepo(url, opts, convertedGitRepoCb) {
}

function convertFolder(rootPath, opts, convertedFolderCb) {
    opts =  opts || { };

    function init() {
        this.data = {
            rootPath        :  rootPath
          , targetPath      :  opts.targetPath      || './tmp/doctoc'
          , directoryFilter :  opts.directoryFilter || undefined
          , fileFilter      :  opts.fileFilter      || undefined
        };
        this();
    }

    function resolveFullRoot () { 
        var that = this;
        fs.realpath (that.data.rootPath, function (err, realPath) { 
            if (err) console.log('Error when resolving full root: ', err);

            that.data.fullRootPath = realPath; 
            that(); 
        });
    }

    function resolveFullTarget (acc) { 
        var that = this;
        fs.realpath (that.data.targetPath, function (err, realPath) { 
            if (err) console.log('Error when resolving full target: ', err);

            that.data.fullTargetPath = realPath; 
            that();
        });
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
            sh.pygmentize(fi.fullPath, tgt, function(err) {
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
}

var opts = { 
    directoryFilter: [ '!.git', '!node_modules' ]
};

convertFolder('./samples/doctoc', opts, function() {
    console.log('done');
});

