var net    =  require('net')
  , log    =  require('npmlog')
  , queue  =  require('minimal-queue')
  , host   =  '127.0.0.1'
  , port   =  9999
  , EOM    =  '_^EOM^_'
  , highlightQueue
  ;

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

module.exports.highlight = highlightQueue.enqueue;

/* Example:
var req1 = {
    action    :  'highlight'
  , language  :  'javascript'
  , outformat :  'html'
  , encoding  :  'utf-8'
  , code      :  'var a = 3;'
};

for (var i = 0; i < 2000; i++)
  highlightQueue.enqueue(req1, function (err, result) {
    log.verbose('Highlighted: ', result);
  });
*/
