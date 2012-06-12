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
    this.data = { 
        url             :  argv.url
      , targetPath      :  argv.target
      , directoryFilter :  argv.directories.split(',')
      , fileFilter      :  argv.files ? argv.files.split(',') : undefined 
    };
    this();
}

function prepareTargetPath() {
    var that = this;
    mkdirp(that.data.targetPath, function(err) {
        if (err) {
            console.log('Unable to create: ', targetPath);
        }
        that();
    });
}

function clone () {
    var that = this;
    service.cloneGitRepository(that.data.url, { targetPath: that.data.targetPath }, function(err, res) {
        if (err) {
            console.log('Unable to clone: ', that.data.url);
            console.log(err);
            return;
        }

        that.data.clonedRepoPath = res.clonedRepoPath;
        that.data.convertedPath = res.clonedRepoPath + '_converted';
        that();
    });
}

function prepareConvertedPath() {
    var that = this;
    mkdirp(that.data.convertedPath, function(err) {
        if (err) {
            console.log('Unable to create: ', convertedPath);
        }
        that();
    });
}

function convert () {
    console.log('converting');
    service.convertFolder(this.data.clonedRepoPath 
                        , { directoryFilter: this.data.directoryFilter
                          , fileFilter: this.data.fileFilter
                          , targetPath: this.data.convertedPath
                          }
                        , this);
}


step( init
    , prepareTargetPath
    , clone
    , prepareConvertedPath
    , convert
    , function(err) { 
        if (err) {
            console.log('Error: ', err);
        } else {
            console.log(this.data);
            console.log ('Everyting is OK.'); 
        }
      }
    )
    ;
