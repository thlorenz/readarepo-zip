var exec = require('child_process').exec;

module.exports.cloneGitRepo = function(url, targetFolder, callback) {
    exec("git clone " + url + " " + targetFolder, callback);
}; 

module.exports.pygmentize = function(sourcePath, targetPath, callback) {
    var cmd = 'pygmentize -f html -O full,style=tango -o ' + targetPath + ' ' + sourcePath;
    exec(cmd, callback); 
};

module.exports.zip = function (sourceDirectoryPath, targetFilePath, callback) {
    var cmd =   'cd ' + sourceDirectoryPath + ';' + 
                ' zip -r ' + targetFilePath + ' .';

    exec(cmd, callback); 
};
