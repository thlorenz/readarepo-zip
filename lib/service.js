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
        this({
            rootPath        :  rootPath
          , targetPath      :  opts.targetPath      || './tmp/doctoc'
          , directoryFilter :  opts.directoryFilter || undefined
          , fileFilter      :  opts.fileFilter      || undefined
        });
    }

    function resolveFullRoot (acc) { 
        var that = this;
        fs.realpath (acc.rootPath, function (err, realPath) { 
            if (err) console.log('Error when resolving full root: ', err);

            acc.fullRootPath = realPath; 
            that(acc); 
        });
    }

    function resolveFullTarget (acc) { 
        var that = this;
        fs.realpath (acc.targetPath, function (err, realPath) { 
            if (err) console.log('Error when resolving full target: ', err);

            acc.fullTargetPath = realPath; 
            that(acc); 
        });
    }

    function getFilesToConvert(acc) { 
        var that = this;
        fsrec.readdir( { 
              root: acc.fullRootPath
            , directoryFilter: acc.directoryFilter
            , fileFilter: acc.fileFilter 
          }
          , function(err, entryInfos) {
              if (err) console.log('Errors when getting files to convert: ', err);

              acc.entryInfos = entryInfos;
              that(acc);
          });
    }

    function prepareTargetDirectories(acc) {
        var that = this;
        mirrorDirectories(acc.fullTargetPath, acc.entryInfos.directories, function() {
            that(acc);
        });
    }

    function syntaxHighlightFiles (acc) {
        var that = this;

        var pending = acc.entryInfos.files.length;
        acc.entryInfos.files.forEach(function(fi) {

            var tgt = path.join(acc.fullTargetPath, fi.path) + '.html';

            // TODO: Use markdown parser for md files and copy files that couldn't be highlighted
            sh.pygmentize(fi.fullPath, tgt, function(err) {
                if (err) {
                    console.log('Error when pygmentizing:', fi.fullPath);
                    console.log(err);
                } 
                if (--pending === 0) that(acc);
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

