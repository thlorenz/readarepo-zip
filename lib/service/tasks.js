var path       =  require('path')
  , mkdirp     =  require('mkdirp')
  , log        =  require('npmlog')
  , step       =  require('step')
  , sh         =  require('../sh')
  , cloner     =  require('./clone')
  , converter  =  require('./convert')
  ;

function prepareConvertedPath() {
  var that = this;
  log.verbose('preparing converted path', that);
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

  log.verbose('converting', opts);

  converter.convertFolder(
      that.data.sourcePath 
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

module.exports.convert = function (opts, convertedCb) {

  function init () {
    try {
      this.data = { 
          convertedPath   :  opts.target
        , sourcePath      :  opts.source
        , repoName        :  path.basename(opts.source)
        , directoryFilter :  opts.directories.split(',')
        , fileFilter      :  opts.files ? opts.files.split(',') :  undefined
        , highlighter     :  opts.highlighter
      };
    } catch (err) {
      convertedCb(err);
      return;
    }

    this();
  }

  step( 
      init
    , prepareConvertedPath
    , convert
    , zipIt
    , convertedCb
    );

};

module.exports.cloneAndConvert = function (opts, clonedAndConvertedCb) {

  function init () {
    try {
      this.data = { 
          url             :  opts.url
        , targetPath      :  opts.target
        , directoryFilter :  opts.directories.split(',')
        , fileFilter      :  opts.files ? opts.files.split(',') :  undefined
        , highlighter     :  opts.highlighter
      };
    } catch (err) {
      clonedAndConvertedCb(err);
      return;
    }

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
      that.data.sourcePath = res.clonedRepoPath;
      that.data.convertedPath = res.clonedRepoPath + '_converted';
      that();
    });
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
