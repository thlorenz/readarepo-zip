var net = require('net');

var opts = {
    host: '127.0.0.1'
  , port: 9999
};


var json = JSON.stringify(opts);
var client = new net.Socket();
var EOM = '_^EOM^_';

var buf = '';
client
  .connect(opts.port, opts.host)
  .on('connect', function () {
    console.log('client connected');

    client.write(json);
    client.write(EOM);
  })
  .on('data', function (data) {
    buf += data;
  })
  .on('end', function () {
    console.log(buf);
    console.log('client disconnected');
  });

