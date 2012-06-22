var fs        =  require('fs')
  , mkdirp    =  require('mkdirp')
  , path      =  require('path')
  ;

module.exports.mirrorDirectories = function (fullRootPath, relSourcePathInfos, mirroredCb) {
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
};

module.exports.didBailOnError = didBailOnError = function (desc, err, onError) {
  if (err) {
    console.log('Error', desc);
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
