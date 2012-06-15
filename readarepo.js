#!/usr/bin/env node
var service =  require('./lib/service')
  , sh      =  require('./lib/sh')
  , fs      =  require('fs')
  , path    =  require('path')
  , mkdirp  =  require('mkdirp')
  , step    =  require('step')
  , argv    =  require('optimist')
        .demand  ( 'u')
        .default ( 't', './tmp')
        .default ( 'd', '!.git,!node_modules')
        .default ( 'f', undefined)
        .default ( 'h', 'pygment')
        .alias   ( 't', 'target')
        .alias   ( 'u', 'url')
        .alias   ( 'd', 'directories')
        .alias   ( 'f', 'files')
        .alias   ( 'h', 'highlighter')
        .argv
  ;

function init () {
    this.data = { 
        url             :  argv.url
      , targetPath      :  argv.target
      , directoryFilter :  argv.directories.split(',')
      , fileFilter      :  argv.files ? argv.files.split(',') : undefined 
      , highlighter     :  argv.highlighter
    };
    this();
}

function prepareTargetPath() {
    var that = this;
    mkdirp(that.data.targetPath, function(err) {
        if (err) {
            console.log('Unable to create: ', targetPath);
            return;
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

        that.data.repoName = res.repoName;
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
            return;
        }
        that();
    });
}

function convert () {
    var that = this;
    service.convertFolder(
        that.data.clonedRepoPath 
      , {   directoryFilter :  that.data.directoryFilter
          , fileFilter      :  that.data.fileFilter
          , targetPath      :  that.data.convertedPath
          , highlighter     :  that.data.highlighter
        }
      , function(err) {
            if (err) console.log('Error: ', err);
            that();
        }
    );
}

function zipIt () {
    var tgt = path.join(this.data.convertedPath, '..', this.data.repoName + '.zip');
    sh.zip(this.data.convertedPath, tgt, this);
}

step( init
    , prepareTargetPath
    , clone
    , prepareConvertedPath
    , convert
    , zipIt
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
