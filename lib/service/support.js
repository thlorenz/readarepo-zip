var fs     =  require('fs')
  , log    =  require('npmlog')
  , mkdirp =  require('mkdirp')
  , path   =  require('path')
  , util   =  require('util')
  , fsrec  =  require('fsrec')
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


module.exports.copyStyles = function (sourceDir, targetDir, copiedStylesCb) {

  mkdirp(targetDir, function (err) {
    if (err) {
      copiedStylesCb(err);
      return;
    }

    fsrec.readdir({
        root: sourceDir
      , fileFilter: '*.css' }
      , function (err, res) {
        if (err) {
          copiedStylesCb(err);
          return;
        }

        var pumping = res.files.length;
        log.verbose('copying styles', pumping);

        res.files.forEach(function (fi) {
          var source = fs.createReadStream(fi.fullPath)
            , target = fs.createWriteStream(path.join(targetDir, fi.name))
            ;

          util.pump(source, target, function (err) {
            if (err) log.error('copying', err);
            if (--pumping === 0) copiedStylesCb(err);
          });
          
        });
      });
  });
};

module.exports.getStyles = function (folder, ext, cb) {

  if (_.isFunction(ext)) {
    cb = ext;
    ext = '.css' ;
  }

  fsrec.readdir({ 
      root: folder
    , fileFilter: function(fi) { 
          return path.extname(fi.name) === ext && fi.name.indexOf('__') === -1;
        } 
      }
    , function (err, res) {
      if (err) {
        error.error('getting styles', err);
        cb([]);
        return;
      }

      cb(
        res.files.map(function(fi) { 
          var extlength = path.extname(fi.name).length;
          return fi.name.substr(0, fi.name.length - extlength);
        })
      );
      }
  );
};
