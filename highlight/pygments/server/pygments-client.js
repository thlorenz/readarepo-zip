var net = require('net');

var opts = {
    host: '127.0.0.1'
  , port: 9999
};


var json = JSON.stringify(opts);
console.log(json);

var client = new net.Socket();

client
  .connect(opts.port, opts.host)
  .on('connect', function () {
    console.log('client connected');
    var buff = new Buffer(json, 'utf-8');
    client.write(buff);
  })
  .on('data', function (data) {
    console.log(data.toString());
    client.destroy();
  })
  .on('end', function () {
    console.log('client disconnected');
  });
