var fs      =  require('fs')
  , fsrec   =  require('fsrec')
  , mkdirp  =  require('mkdirp')
  , path    =  require('path')
  , _       =  require('underscore')
  , sh      =  require('./lib/sh')
  ;


var repoUrl = 'https://github.com/thlorenz/readarepo.git'
  , repoName = 'readarepo' // TODO: derive
  , tmpPath  = './tmp'
  , sourceRoot = path.join(tmpPath, repoName)
  , targetRoot = path.join(tmpPath, repoName + '_converted')
  , fullSourceRoot
  , fullTargetRoot
  ;


var sourceFiles = []
  , sourcePaths = []
  ;

function processRepoContent (err, res) {
    if (err) {
        console.log('warn: ', err);
    }

    if (!res) {
        console.log('no response, nothing I can do!');
        return;
    }

    function prepareTargetDirectories(cb) {
        var pending = res.directories.length;
        res.directories
            .forEach(function(di) { 
                var dir = path.join(fullTargetRoot, di.path);
                console.log('Creating: ', dir);
                mkdirp(dir, function(err) {
                    if (err) {
                        console.log('Unable to created: ', dir);
                    }
                    if (--pending === 0) cb();
                });
            });
    }

    function syntaxHighlightFiles (cb) {
        var pending = res.files.length;

        res.files.forEach(function(fi) {

            var tgt = path.join(fullTargetRoot, fi.path) + '.html';

            sh.pygmentize(fi.fullPath, tgt, function(er) {
                if (err) {
                    console.log('error pygmentizing:', fi.fullPath);
                    console.log(err);
                } 
                if (--pending === 0) cb();
            });
        });
    }

    prepareTargetDirectories(function () {
        syntaxHighlightFiles(function() { 
            console.log('files highlighted'); 
            sh.zip(fullTargetRoot, path.join(tmpPath, repoName + '.zip'), function() {
                console.log('zipped', arguments);
            });
        });
    });
}

fs.realpath(sourceRoot, function(err, realPath) {
    fullSourceRoot = realPath;

    fs.realpath(targetRoot, function(err, realPath) {
        fullTargetRoot = realPath;

        sh.gitClone(repoUrl, fullSourceRoot, function() {
            console.log('cloned repo', arguments);
            fsrec.readdir( { 
                root: fullSourceRoot
                , directoryFilter: ['!.git', '!node_modules'] 
                }
                , processRepoContent);
        });
    });
});


