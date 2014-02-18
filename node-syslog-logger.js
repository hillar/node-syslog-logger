/*
// simple helper around node-syslog
//
// throws no exceptions
//
// log level can be set any between debug to emergency,
// default level is notice
// log facility can be set 
// default is syslog
//
//
//        Numerical         Severity
//          Code
//
//           0       Emergency: system is unusable
//           1       Alert: action must be taken immediately
//           2       Critical: critical conditions
//           3       Error: error conditions
//           4       Warning: warning conditions
//           5       Notice: normal but significant condition
//           6       Informational: informational messages
//           7       Debug: debug-level messages
//
// see rfc https://www.ietf.org/rfc/rfc3164.txt
//
// if there was error to send msg to syslog, next time tries to log that to
//
// some saple code ...

var Syslog = require('node-syslog-logger');

var log = new Syslog();

log.emergency('disk free space is less than 1%',function afterSyslog(err){
	if ( err ) {
		console.error('didnt get trough to syslog',err);
	}
});
// or just...
log.notice("action=login; user=" + username + ";"); // for audit record
log.warning("action=blocked; reason=wrong_passwd; user=" + username + ";"" ); //should be warned, if many accounts blocked
log.error("condition=user_session_do_not_match; user="+ username + "; session_id=" + session_id + ";"); //session hijack ?

// if you are using it, try to be nice to log parsers, use key value or something, what can be grok'ed
// it is very very rare, that humans are reading syslog ;)
// so make it _machine_ readable !

*/


var nodeSyslog = require('node-syslog');

module.exports = nodeSyslogLogger;

process.on('exit', function (code) {
	// exiting anyway, so no extra try catch here
	nodeSyslog.init(process.title, nodeSyslog.LOG_PID | nodeSyslog.LOG_ODELAY, nodeSyslog.LOG_SYSLOG);
    nodeSyslog.log(nodeSyslog.LOG_NOTICE, 'action=exit; exit_code=' + code + ';');
});


function nodeSyslogLogger (options) {

	var _options = options || {};
	this._name = _options.tag || process.title;
	this._level = _options.level || nodeSyslog.LOG_NOTICE;
	this._facility = _options.facility || nodeSyslog.LOG_SYSLOG;
	this._lasterror = null;
	this._lasterrorTime = null;
	this._lasterrorCount = 0;
	var _this = this;
	this._init(this._name,this._facility, function afterInit(err) {
		if ( !err ) {
			_this._log(nodeSyslog.LOG_NOTICE, 'action=start; log_level=' + _this._level + '; log_facility=' + _this._facility + ';');
		} 

	});
}


nodeSyslogLogger.prototype._close = function () {

	nodeSyslog.close();

};


nodeSyslogLogger.prototype._init = function (name, facility, cb) {

	try {
		nodeSyslog.init(name, nodeSyslog.LOG_PID | nodeSyslog.LOG_ODELAY, facility);
	} catch (err) {
		this._lasterror = err;
		this._lasterrorMsg = 'syslog init failed';
		this._lasterrorTime = new Date().toISOString();
		return cb(err);
	} 
	return cb(null);

};


nodeSyslogLogger.prototype._log  = function (level, msg, cb) {

	if ( ! msg ) return cb(null); // ignore empty messages
	var _cb = cb || function(e,r) {}; // ?
	if (this._lasterror) {
		var _msg = 'last_error_time=' + this._lasterrorTime + ' syslog_error=(' + this._lasterror + '); ' + 'missed_total='+this._lasterrorCount+'; '; 
		_msg += 'last_message=(' + this._lasterrorMsg + ');';
		var canSettoZero = true;
		try {
			nodeSyslog.init(process.title, nodeSyslog.LOG_PID | nodeSyslog.LOG_ODELAY, nodeSyslog.LOG_SYSLOG);
		} catch (err) { 
			canSettoZero = false;
		}
		try {
			nodeSyslog.log(nodeSyslog.LOG_NOTICE, _msg);
		} catch (err) { 
			canSettoZero = false;
		}
		if ( canSettoZero ) {
			this._lasterror = null; 
		} else {
			// make a queue here ?
			// check do we have tty ?
		}
	}
	try {
		nodeSyslog.log(level, msg);
	} catch (err) {
		if ( err == 'Error: init method has to be called befor syslog' ) { // https://github.com/schamane/node-syslog/blob/master/syslog.cc#L93
			var _this = this;
			this._init(this.name,this._facility, function afterReinit(err) {
				if ( !err ) {
					_this._log(level,msg,cb);
				} else {
					_this._lasterror = err;
					_this._lasterrorMsg = msg;
					_this._lasterrorTime = new Date().toISOString();
					this._lasterrorCount += 1;
					return _cb(err);	
				}
			});
		} else {
			this._lasterror = err;
			this._lasterrorMsg = msg;
			this._lasterrorTime = new Date().toISOString();
			this._lasterrorCount += 1;
			return _cb(err);
		}
	} 
	return _cb(null);

};


nodeSyslogLogger.prototype.emergency = function (msg, cb) {

	if ( nodeSyslog.LOG_EMERG <= this._level ) {
		this._log(nodeSyslog.LOG_EMERG, msg, cb);
	} else {
		return cb(null);
	}

};


nodeSyslogLogger.prototype.alert = function (msg, cb) {

	if ( nodeSyslog.LOG_ALERT <= this._level ) {
		this._log(nodeSyslog.LOG_ALERT, msg, cb);
	} else {
		return cb(null);
	}

};


nodeSyslogLogger.prototype.critical = function (msg, cb) {

	if ( nodeSyslog.LOG_CRIT <= this._level ) {
		this._log(nodeSyslog.LOG_CRIT, msg, cb);
	} else {
		return cb(null);
	}

};


nodeSyslogLogger.prototype.error = function (msg, cb) {

	if ( nodeSyslog.LOG_ERR <= this._level ) {
		this._log(nodeSyslog.LOG_ERR, msg, cb);
	} else {
		return cb(null);
	}

};


nodeSyslogLogger.prototype.warning = function (msg, cb) {

	if ( nodeSyslog.LOG_WARNING <= this._level ) {
		this._log(nodeSyslog.LOG_WARNING, msg, cb);
	} else {
		return cb(null);
	}

};


nodeSyslogLogger.prototype.notice = function (msg, cb) {

	if ( nodeSyslog.LOG_NOTICE <= this._level ) {
		this._log(nodeSyslog.LOG_NOTICE, msg, cb);
	} else {
		return cb(null);
	}

};


nodeSyslogLogger.prototype.info = function (msg, cb) {

	if ( nodeSyslog.LOG_INFO <= this._level ) {
		this._log(nodeSyslog.LOG_INFO, msg, cb);
	} else {
		return cb(null);
	}

};

nodeSyslogLogger.prototype.debug = function (msg, cb) {

	if ( nodeSyslog.LOG_DEBUG <= this._level ) {
		this._log(nodeSyslog.LOG_DEBUG, msg, cb);
	} else {
		return cb(null);
	}

};
