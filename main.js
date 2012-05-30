var exec    =  require('child_process').exec,
    file    =  require('file'),
    path    =  require('path'),
    _       =  require('underscore');


var sourceRoot = './samples/doctoc';
var targetRoot = './tmp';
var ignoredPaths = ['.git', 'node_modules'];


function isIgnored(fi) {
    return  !(fi.stat.isDirectory() && _(ignoredPaths).contains(fi.name));
}

function pathDoesnExist(fi, cb) { 
    path.exists(fi, function (exists) { cb(!exists); });
}

function prepTargetPaths(fi) {

     
}


var sourceFiles = [],
    sourcePaths = [];
function createTargetPaths() {

    function mkdirs(dirs, mode, cb){
        (function next(e) {
            (!e && dirs.length) ? fs.mkdir(dirs.shift(), mode, next) : cb(e);
        })(null);
    };

    targetPaths = _(sourceFiles)
        .chain()
        .pluck('path')
        .map(function (x) { return path.join(targetRoot, path.dirname(x)); })
        .uniq()
        .value();

    console.log('paths', targetPaths);
}

file.walk(sourceRoot, function (err, dir, subdirs, files) { 
    sourcePaths.push({
        path: dir,
        files: files
    });
});
console.log(sourcePaths);


