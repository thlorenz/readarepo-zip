#!/usr/bin/env node
var service =  require('./lib/service')
  , log     =  require('npmlog')
  , argv    =  require('optimist')
    .demand  ( 's')
    .default ( 't', './tmp')
    .default ( 'd', '!.git,!node_modules')
    .default ( 'f', undefined)
    .default ( 'h', 'pygments')
    .default ( 'l', 'info')
    .alias   ( 's', 'source')
    .alias   ( 't', 'target')
    .alias   ( 'd', 'directories')
    .alias   ( 'f', 'files')
    .alias   ( 'h', 'highlighter')
    .alias   ( 'l', 'loglevel')
    .argv
  ;

var usingPygments = argv.highlighter === 'pygments';
service.configure( { loglevel:  argv.loglevel } );

function startConversion() {
  service.convert(argv, function(err) { 

    if (err) {
      log.error(err);
    } else {
      log.info ('Everyting is OK.'); 
    }

    if (usingPygments) {
      service.stopPygmentsService();
    }
  });
}

// Startup Pygments service if pygments highlighter is used
if (usingPygments) {

  service.startPygmentsService(function (err, res) {
    if (err) { 
      log.error(err);
      log.info('Problem starting up pygments service. Aborting.');
      process.exit(1);
    } else {
      startConversion();
    }
  });

} else {
  startConversion();
}
