#!/usr/bin/env node
var service = require('./lib/service')
  , fs   = require('fs')
  , mkdirp  =  require('mkdirp')
  , step = require('step')
  , argv = require('optimist')
        .default('t', './tmp')
        .default('d', '!.git,!node_modules')
        .default('f', undefined)
        .demand('u')
        .alias('t', 'target')
        .alias('u', 'url')
        .alias('d', 'directories')
        .alias('f', 'files')
        .argv
  ;

function init () {
    return { 
        url             :  argv.url
      , targetPath      :  argv.target
      , directoryFilter :  argv.directories.split(',')
      , fileFilter      :  argv.files ? argv.files.split(',') : undefined 
    };
}

function prepareTargetPath(args, cb) {
    mkdirp(args.targetPath, function(err) {
        if (err) {
            console.log('Unable to create: ', args.targetPath);
        }
        cb();
    });
}

function clone (args, cb) {
    console.log('cloning',args.url);
    service.cloneGitRepository(args.url, { targetPath: args.targetPath }, function(err, res) {
        if (err) {
            console.log('Unable to clone: ', args.url);
            console.log(err);
        }

        args.clonedRepoPath = res.clonedRepoPath;
        args.convertedPath = res.clonedRepoPath + '_converted';
        console.log('cloned');
        cb();
    });
}

function prepareConvertedPath(args, cb) {
    mkdirp(args.convertedPath, function(err) {
        if (err) {
            console.log('Unable to create: ', args.convertedPath);
        }
        cb();
    });
}

function convert (args, cb) {
    console.log('converting');
    service.convertFolder(args.clonedRepoPath 
                        , { directoryFilter :  args.directoryFilter
                          , fileFilter      :  args.fileFilter
                          , targetPath      :  args.convertedPath
                          }
                        , cb);
}

var args = init();
prepareTargetPath(args, function() {
    clone(args, function() {
        prepareConvertedPath(args, function() {
            convert(args, function() {
                console.log(this.data);
                console.log ('Everyting is OK.'); 
            });
        });
    });
});

/*
step( init
    , prepareTargetPath
    , clone
    , prepareConvertedPath
    , convert
    , function() { 
        console.log(this.data);
        console.log ('Everyting is OK.'); 
      }
    )
    ;
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
