/*

$ node test-node-syslog-logger.js  
$ tail -25 /var/log/syslog

and you should see this in your syslog..

Feb  9 23:16:45 ubu-precise node[18531]: action=start; log_level=7; log_facility=40;
Feb  9 23:16:45 ubu-precise node[18531]: test=alert
Feb  9 23:16:45 ubu-precise node[18531]: test=emergency 
Feb  9 23:16:45 ubu-precise node[18531]: test=critical
Feb  9 23:16:45 ubu-precise node[18531]: test=error
Feb  9 23:16:45 ubu-precise node[18531]: test=warning
Feb  9 23:16:45 ubu-precise node[18531]: test=notice
Feb  9 23:16:45 ubu-precise node[18531]: test=info
Feb  9 23:16:45 ubu-precise node[18531]: test=debug
Feb  9 23:16:45 ubu-precise node[18531]: last_error_time=2014-02-09T21:16:45.535Z syslog_error=(Error: Must give daemonname string as argument); count_total=0; last_message=(syslog init failed);
Feb  9 23:16:45 ubu-precise node[18531]: this is next msg, hope it has last error on top of it
Feb  9 23:16:45 ubu-precise node[18531]: last_error_time=2014-02-09T21:16:45.537Z syslog_error=(Error: Must give daemonname string as argument); count_total=0; last_message=(syslog init failed);
Feb  9 23:16:45 ubu-precise node[18531]: this is next msg, hope it has last error on top of it
Feb  9 23:16:45 ubu-precise node[18531]: action=exit; exit_code=0;


*/


var NodeSyslogLogger = require('./nodesysloglogger');

var log = new NodeSyslogLogger({level:7});

function after (err) {
	if ( err ) {
		console.error('didnt get trough to syslog',err);
	} else {
		console.log('msg sent to syslog');
	}
};

log.emergency('test=emergency ', after);
log.alert('test=alert',after);
log.critical('test=critical',after);
log.error('test=error',after);
log.warning('test=warning',after);
log.notice('test=notice',after);
log.info('test=info',after);
log.info('test=debug',after);
log._init(null,null,function(e){}); // make error here
log.debug('this will not go to syslog');
log.debug('this is next msg, hope it has last error on top of it');
log._init(process.name,null,function(e){}); // make error here
log.debug('this will not go to syslog');
log.debug('this is next msg, hope it has last error on top of it');







