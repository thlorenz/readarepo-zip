var net           =  require('net')
  , log           =  require('npmlog')
  , queue         =  require('minimal-queue')
  , child_process =  require('child_process')
  , spawn         =  child_process.spawn
  , exec          =  child_process.exec
  , host          =  '127.0.0.1'
  , port          =  9999
  , EOM           =  '_^EOM^_'
  , highlightQueue
  , service
  ;

function startService (cb) {
  var command = 'python'
    , args = [ __dirname + '/pygments-service.py' ]
    , errors = ''
    ;

  log.verbose('Executing: ', command, args);
  
  service = spawn(command, args);

  service.stdout.once('data', function (data) {
    cb(null, 'pygments started up OK');
  });
  service.stdout.on('data', function (data) {
    log.silly(data);   
  });
  service.stderr.on('data', function (data) {
    log.error(data);
    errors += data +'\n';
  });
  service.on('exit', function (code, signal) {
    log.verbose('pygments service','exited with code: %d due to signal: %s', code, signal);
    if (code > 0) {
      cb(errors, null);
    }
  });
}

function stopService () {
  if (service) {
    service.kill(); 
    log.verbose('Killing pygments service.');
  } else {
    log.error('Tried to kill pygments service, but it is not running.');
  }
}

highlightQueue = queue.up(function highlight(req, highlightedCb) {

  var reqString =  JSON.stringify(req)
    , client    =  new net.Socket()
    , buf       =  ''
    , self      =  this
    ; 

  client
    .connect(port, host)
    .on('connect', function () {
      client.write(reqString + EOM);
    })
    .on('data', function (data) {
      buf += data;
    })
    .on('end', function () {
      highlightedCb(null, buf);
      self.done();
    })
    .on('error', function (err) {
      log.verbose('pygments client encountered error', err);
      highlightedCb(err);
      self.done();
    });
});

highlightQueue.concurrency = 2;

module.exports = {
    highlight    :  highlightQueue.enqueue
  , startService :  startService
  , stopService  :  stopService
};


/* Example:
var req1 = {
    action    :  'highlight'
  , language  :  'javascript'
  , outformat :  'html'
  , encoding  :  'utf-8'
  , code      :  'var a = 3;'
};


startService(function (err, res) {
  console.log(arguments);
});

for (var i = 0; i < 2000; i++)
  highlightQueue.enqueue(req1, function (err, result) {
    log.verbose('Highlighted: ', result);
  });

setTimeout(stopService, 2000);
function stopService() {
  service.kill('SIGTERM');
}
*/
