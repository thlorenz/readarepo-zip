var child_process =  require('child_process')
  , exec          =  child_process.exec
  , spawn         =  child_process.spawn
  , log           =  require('npmlog')
  , util          =  require('util')
  ;

function execute (command, args, callback) {
  var errors  =  []
    , infos   =  []
    , spawned =  spawn (command, args)
    ;

  spawned.stdout.on('data', function(data) {
    var msg = util.format('%s', data.toString());
    if (msg.length === 0) return;

    log.info(command, msg);
    infos.push(msg);
  });
  spawned.stderr.on('data', function(data) {
    var msg = util.format('%s', data.toString());
    log.error(command, msg);
    errors.push(msg);
  });
  spawned.on('exit', function(code) {
    log.verbose(command, 'exited with: ' + code);
    callback((errors.length > 0 ? errors : null), infos);
  });
}

module.exports.gitClone = function(url, targetFolder, callback) {
  execute ('git', [ 'clone', url, targetFolder ], callback);
}; 

module.exports.pygmentize = function(sourcePath, targetPath, opts, callback) {
  opts = opts || { };
  opts.style = opts.style || 'tango';

  var cmd = './3rd/pygments/pygmentize -f html -O full,style=' + opts.style + ' -o ' + targetPath + ' ' + sourcePath;
  exec(cmd, callback);
};

module.exports.zip = function (sourceDirectoryPath, targetFilePath, callback) {
  var cmd = 'cd ' + sourceDirectoryPath + ';' + 
            ' zip -r ' + targetFilePath + ' .';

  exec(cmd, callback); 
};
