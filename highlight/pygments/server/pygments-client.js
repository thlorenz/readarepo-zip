var net    =  require('net')
  , log    =  require('npmlog')
  , queue  =  require('minimal-queue')
  , host   =  '127.0.0.1'
  , port   =  9999
  , EOM    =  '_^EOM^_'
  , highlightQueue
  ;


log.level = 'silly';

highlightQueue = queue.up(function highlight(req, highlightedCb) {

  var reqString =  JSON.stringify(req)
    , client    =  new net.Socket()
    , buf       =  ''
    , self      =  this
    ; 

  client
    .connect(port, host)
    .on('connect', function () {
      log.silly('pygments client connected');
      client.write(reqString + EOM);
    })
    .on('data', function (data) {
      buf += data;
    })
    .on('end', function () {
      log.silly('pygments client disconnected');
      highlightedCb(null, buf);
      self.done();
    })
    .on('error', function (err) {
      log.verbose('pygments client encountered error', err);
      highlightedCb(err);
      self.done();
    });
});

highlightQueue.concurrency = 5;

var req1 = {
    language: 'javascript'
  , code: 'var a = 3;'
};

var req2 = {
    language: 'javascript'
  , code: 'function () { return  5; }'
};

highlightQueue.enqueue(req1, function (err, result) {
  log.verbose('Highlighted: ', result);
});
highlightQueue.enqueue(req2, function (err, result) {
  log.verbose('Highlighted: ', result);
});
