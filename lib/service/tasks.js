var path      =  require('path')
  , mkdirp    =  require('mkdirp')
  , log       =  require('npmlog')
  , step      =  require('step')
  , sh        =  require('../sh')
  , cloner    =  require('./clone')
  , converter =  require('./convert')
  ;

module.exports.cloneAndConvert = function (opts, clonedAndConvertedCb) {

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
    
    log.info('Cloning', { url: that.data.url, target: that.data.targetPath });

    cloner.cloneGitRepository(that.data.url, { targetPath: that.data.targetPath }, function(err, res) {
      if (err) {
        log.error('Unable to clone: ', that.data.url);
        log.error(err);
        return;
      }

      log.verbose('cloned', res);

      that.data.repoName = res.repoName;
      that.data.clonedRepoPath = res.clonedRepoPath;
      that.data.convertedPath = res.clonedRepoPath + '_converted';
      that();
    });
  }

  function prepareConvertedPath() {
    var that = this;
    log.verbose('preparing converted path', that.data.convertedPath);

    mkdirp(that.data.convertedPath, function(err) {
      if (err) {
        log.error('Unable to create: ', convertedPath);
        return;
      }
      that();
    });
  }

  function convert () {
    var that = this
      , opts = {   
            directoryFilter :  that.data.directoryFilter
          , fileFilter      :  that.data.fileFilter
          , targetPath      :  that.data.convertedPath
          , highlighter     :  that.data.highlighter
        }
      ;

    log.info('converting', 'using ' + that.data.highlighter + ' converter');
    log.verbose('converting', opts);

    converter.convertFolder(
        that.data.clonedRepoPath 
      , opts
      , function(err) {
          if (err) log.error(err);
          that();
        }
    );
  }

  function zipIt () {
    var src = this.data.convertedPath
      , tgt = path.join(this.data.convertedPath, '..', this.data.repoName + '.zip');
    
    log.info('zipping', { src: src, tgt: tgt });

    sh.zip(src, tgt, this);
  }

  step( 
      init
    , prepareTargetPath
    , clone
    , prepareConvertedPath
    , convert
    , zipIt
    , clonedAndConvertedCb
    );
};
