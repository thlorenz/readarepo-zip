var log = require('npmlog')
  , tasks = require('./service/tasks')
  , pygsClient =  require('../highlight/pygments/server/pygments-client')
  ;

module.exports = {
    convertFolder        :  require('./service/convert').convertFolder
  , cloneGitRepository   :  require('./service/clone').cloneGitRepository
  , cloneAndConvert      :  tasks.cloneAndConvert
  , convert              :  tasks.convert
  , startPygmentsService :  pygsClient.startService
  , stopPygmentsService  :  pygsClient.stopService
};
  
module.exports.configure = function (opts) {
    log.level = opts.loglevel || 'info';
};

