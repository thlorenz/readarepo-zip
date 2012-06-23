var mkdirp    =  require('mkdirp')
  , path      =  require('path')
  , log       =  require('npmlog')
  , step      =  require('step')
  , sh        =  require('../sh')
  , common    =  require('../common')
  , support   =  require('./support')
  ;


module.exports.cloneGitRepository = function (url, opts, clonedGitRepoCb) {
  opts =  opts || { };

  function bailedOnError (desc, err) {
    return support.didBailOnError(desc, err, clonedGitRepoCb);
  }

  function init() {
    this.data = {
        url        :  url
      , targetPath :  opts.targetPath || path.join(common.paths.root, 'tmp')
      , onError    :  clonedGitRepoCb
    };
    log.verbose('initialized', this.data);
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
    var that = this;

    that.data.clonedRepoPath = path.join(that.data.fullTargetPath, that.data.repoName);

    log.verbose('preparing target', that.data.clonedRepoPath);

    mkdirp(that.data.fullTargetPath, function(err) {
      if (bailedOnError('when preparing target directory', err)) return;
      that();
    });
  }
  
  function cloneRepo() {
    var that = this;
    log.verbose('cloning git repo');

    sh.gitClone(that.data.url, this.data.clonedRepoPath,  function(err) {
      if (bailedOnError('when cloning repository', err)) return;
      that();
    });
  }
  
  step( 
      init
    , support.resolveFullTarget
    , getRepoName
    , prepareTargetDirectory
    , cloneRepo
    , function cloned(err) { 
        clonedGitRepoCb(err, this.data);
      }
    );
};
