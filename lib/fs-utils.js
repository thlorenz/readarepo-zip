Array.prototype.unique = function() {
  var o = {},
        i, 
        l = this.length,
        r = [];

    for (i = 0; i < l; i += 1) o[this[i]] = this[i];
    for (i in o) r.push(o[i]);
    return r;
};

var fs = require('fs'),
    path = require('path');

function walk(opts, cb) {
    opts.root       = opts.root       || '.';
    opts.pathFilter = opts.pathFilter || [];
    opts.fileFilter = opts.fileFilter || [];
    opts.depth      = opts.depth      || 9999;
    opts.progress   = opts.progress   || function (pathInfo) { /* specify this option to get updates for every path found */ };
    opts.error      = opts.error      || function (error) { console.log(error); };

    var walkResult = {
        directories: [],
        files: []
    };

    walkRec(opts.root, cb);

    function walkRec(currentDir) {
        fs.readdir(currentDir, function (err, entries) {
            if (err) {
                opts.error(err);
                return;
            }

            process(currentDir, entries, function(fileInfos) {
                var subdirs = fileInfos
                    .filter(function(fi) { return fi.stat.isDirectory(); })
                    .unique();
                subdirs.forEach(function (fi) { walkResult.directories.push(fi); });

                fileInfos
                    .filter(function(fi) { return fi.stat.isFile(); })
                    .forEach(function (fi) { walkResult.files.push(fi); });

                cb(walkResult);
            });
        });
    }

    function process(currentDir, entries, callProcessed) {
        var total = entries.length,
            processed = 0,
            fileInfos = [],
            dir = currentDir.substr(opts.root.length);

        entries
            .forEach(function (entry) { 

                var fullPath = path.join(currentDir, entry),
                    relPath  = path.join(dir, entry);

                fs.stat(fullPath, function (err, stat) {
                    if (err) {
                        opts.error(err);
                    } else {
                        fileInfos.push({
                            parentDir     :  dir,
                            fullParentDir :  currentDir,
                            name          :  entry,
                            path          :  relPath,
                            fullPath      :  fullPath,
                            stat          :  stat
                        });
                    }
                    processed++;
                    if (processed === total) callProcessed(fileInfos);
                }
            );

        });

    }
}

var opts = {
    root: path.join(__dirname, '/../samples/doctoc')
};

walk(opts, function (res) {
    console.log('done', res);
});
