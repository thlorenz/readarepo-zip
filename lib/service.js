var log = require('npmlog');

module.exports = {
    convertFolder      :  require('./service/convert').convertFolder
  , cloneGitRepository :  require('./service/clone').cloneGitRepository
  , cloneAndConvert    :  require('./service/tasks').cloneAndConvert
};
  
module.exports.configure = function (opts) {
    log.level = opts.loglevel || 'info';
};

