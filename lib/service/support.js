var fs        =  require('fs')
  , log       =  require('npmlog')
  , mkdirp    =  require('mkdirp')
  , path      =  require('path')
  ;

module.exports.mirrorDirectories = function (fullRootPath, relSourcePathInfos, mirroredCb) {
  var pending = relSourcePathInfos.length;

  log.verbose('mirroring directories', { root: fullRootPath , count: pending });

  if (pending === 0) { mirroredCb(); return; }

  relSourcePathInfos
    .forEach(function(sourcePathInfo) { 
      var dir = path.join(fullRootPath, sourcePathInfo.path);
      mkdirp(dir, function(err) {
        if (err) {
          log.error('Unable to create: ', dir);
        }
        if (--pending === 0) mirroredCb();
      });
    });
};

module.exports.didBailOnError = didBailOnError = function (desc, err, onError) {
  if (err) {
    log.error(desc);
    onError(err);
    return true;
  } else {
    return false;
  }
};

module.exports.resolveFullRoot = function (onError) { 
  var that = this;
  fs.realpath (that.data.rootPath, function (err, realPath) { 
    if (didBailOnError('when resolving full root.', err, onError || that.onError)) return;

    that.data.fullRootPath = realPath; 
    that(); 
  });
};

module.exports.resolveFullTarget = function (onError) { 
  var that = this;
  fs.realpath (that.data.targetPath, function (err, realPath) { 
    if (didBailOnError('when resolving full target.', err, onError || that.onError)) return;

    that.data.fullTargetPath = realPath; 
    that(); 
  });
};