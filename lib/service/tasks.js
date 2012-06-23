var path    =  require('path')
  , mkdirp  =  require('mkdirp')
  , log     =  require('npmlog')
  , step    =  require('step')
  , sh      =  require('../sh')
  , clone   =  require('./clone')
  , convert =  require('./convert')
  ;

module.exports.cloneAndConvert = function (opts) {

  function init () {
    this.data = { 
        url             :  opts.url
      , targetPath      :  opts.target
      , directoryFilter :  opts.directories.split(',')
      , fileFilter      :  opts.files ? opts.files.split(',') :  undefined
      , highlighter     :  opts.highlighter
    };
    this();
  }

  function prepareTargetPath() {
    var that = this;
    log.verbose('Preparing target path');

    mkdirp(that.data.targetPath, function(err) {
      if (err) {
        log.error('Unable to create: ', targetPath);
        return;
      }
      that();
    });
  }

  function clone () {
    var that = this;
    
    log.verbose('cloning', { url: that.data.url, target: that.data.targetPath });

    clone.cloneGitRepository(that.data.url, { targetPath: that.data.targetPath }, function(err, res) {
      if (err) {
        log.error('Unable to clone: ', that.data.url);
        log.error(err);
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
    convert.convertFolder(
        that.data.clonedRepoPath 
      , { directoryFilter :  that.data.directoryFilter
          , fileFilter    :  that.data.fileFilter
          , targetPath    :  that.data.convertedPath
          , highlighter   :  that.data.highlighter
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

  step( 
      init
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
    );
};
