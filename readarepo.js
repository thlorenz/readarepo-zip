#!/usr/bin/env node
var service =  require('./lib/service')
  , log     =  require('npmlog')
  , argv    =  require('optimist')
    .demand  ( 'u')
    .default ( 't', './tmp')
    .default ( 'd', '!.git,!node_modules')
    .default ( 'f', undefined)
    .default ( 'h', 'pygment')
    .default ( 'l', 'info')
    .alias   ( 't', 'target')
    .alias   ( 'u', 'url')
    .alias   ( 'd', 'directories')
    .alias   ( 'f', 'files')
    .alias   ( 'h', 'highlighter')
    .alias   ( 'l', 'loglevel')
    .argv
  ;

service.configure( { loglevel:  argv.loglevel } );

service.cloneAndConvert(argv, function(err) { 
  if (err) {
    log.error(err);
  } else {
    log.info ('Everyting is OK.'); 
  }
});
