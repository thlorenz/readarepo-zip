var log = require('npmlog')
  , tasks = require('./service/tasks');

module.exports = {
    convertFolder      :  require('./service/convert').convertFolder
  , cloneGitRepository :  require('./service/clone').cloneGitRepository
  , cloneAndConvert    :  tasks.cloneAndConvert
  , convert            :  tasks.convert
};
  
module.exports.configure = function (opts) {
    log.level = opts.loglevel || 'info';
};

