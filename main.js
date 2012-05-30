var exec    =  require('child_process').exec,
    asyncjs =  require('asyncjs'),
    path    =  require('path'),
    _       =  require('underscore');


var dir = './samples/doctoc';
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
    sourcePaths;
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

asyncjs
    .walkfiles(dir, isIgnored)
    .each(function (fi) { sourceFiles.push(fi); })
    .end(createTargetPaths);


