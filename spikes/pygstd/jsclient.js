var child_process =  require('child_process')
  , exec          =  child_process.exec
  , spawn         =  child_process.spawn
  , log           =  require('npmlog')
  , EOM           =  '_^EOM^_'
  ;

log.loglevel = 'silly';

var pyth = spawn ('python', [__dirname + '/pyserv.py']);

pyth.stderr.on('data', function (data) {
  log.error('client', data.toString());  
});

var buf = '';
pyth.stdout.on('data', function (data) {
  var lines = data.toString().split('\n');

  lines.forEach(function (line) {
    if (line === EOM) {
      log.info('client', 'got message');
      log.info('client', buf);
      buf = '';
    } else {
      buf += line + '\n';
    }
  });
});

pyth.stdin.write('hello ');
pyth.stdin.write('world\n');
pyth.stdin.write('hello ');
pyth.stdin.write('world\n');
pyth.stdin.write(EOM + '\n');
pyth.stdin.end();

pyth.stdin.write('how ');
pyth.stdin.write('are');
pyth.stdin.write('you\n');
pyth.stdin.write(EOM + '\n');

pyth.stdin.end();

