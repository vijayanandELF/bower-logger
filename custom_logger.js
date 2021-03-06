/** @author VijayAnand Santhiyagu */
/*  Logger Utility */
/* This library helps for advanced logging */
/* Configuration can also can be done */

/** For best practices, we will be using this service, instead of console.log
  * @example logger.log("loglevel", "logcategory", logmsg, [logmsgs][..])
  *  @param {loglevels} - all, none, log, debug, info, warn, error
  *   logLevels have this precedence
  *  		log - error, warn, debug, info, log
			debug - error, warn, info, log
			info - error, warn, info
			warn - error, warn
			error - error
  *
  *  @param {logTypes} - It is set in the config object, for example: mongo, sockets, etc.,
  *  @param {logmsg} - Message to be printed, string, object, array, int
  */

/** Configure this variable if you want to have your custom config */
(function(){ 

	var logConfig;

	if ((typeof logConfig == 'undefined') || !logConfig.hasOwnProperty('enableLog')) {
		// Set the default log configuration, if it is not available globally
		logConfig = {
			enableLog: true,
			logTypes: {
				//all: true,
				none: false,
				sockets: "debug",
				app: "all"
			}
		};
	}

	/** This variable is the local object reference, which has functions,
	  * only required functions will be bound to global reference
	  */
	var _this = {};

	/* Define the style for each layer in the output */
	var _style = {
		timestamp: 'color:green',
		level: null,
		category: 'color:#B30BF9; font-style:oblique',
		message: 'color: black'
	};


	_this.levels = ["all", "log", "debug", "info", "warn", "error", "none"];
	_this.logTypes = {all: true, none: false};

	var getTime = function () {
		var today = new Date();
		var datetime =  today.getDate() + "/" 
						+ (today.getMonth() + 1) + "/"
						+ today.getFullYear() + " "
						+ today.getHours() + ":"
						+ today.getMinutes() + ":"
						+ today.getSeconds(); 
		return datetime;
	};

	var getFormattedParams = function (args) {
		var params = [], i;
		params.push("" + getTime() + " - ");
		params.push("[" + args[0] + "]");
		params.push(args[1]);

		/* Format the output */
		// Internet explorer don't support %c, i.e user defined styles in the console
		if (isColorSupported()) {
			// String specifies how to format the console output
			// String  Color String  Color String   String
			params.splice(0, 0, "%c%s %c%s %c%s %c "); 

			params.splice(1, 0, _style.timestamp);

			params.splice(3, 0, _style.level);

			params.splice(5, 0, _style.category);

			params.splice(7, 0, _style.message);
		}

		if (args && (args.length > 2)) {
			for (i = 2; i < args.length; i++) {
				params.push(args[i]);
			}
		}
		params.push("\n Called"+getStack().slice(0));
		return params;
	};

	var log = function () {
		if (shouldLog(arguments[0], arguments[1])) {
			switch (arguments[0]) {
				case 'error':
					_style.level = "font-weight: bold; color: red";
					break;
				case 'warn':
					_style.level = "color: red";
					break;

				case 'debug':
					_style.level = "color: #777978";
					console.debug = (!console.debug) ? console.log : console.debug;
					break;
				case 'info':
					_style.level = "color: magenta";
					console.info = (!console.info) ? console.log : console.info;
					break;
				case 'log':
					_style.level = "color: grey";
					break;
				default:
					_style.level = "color: grey";
			}
			if (console[arguments[0]]['apply']) {
				console[arguments[0]].apply(console, getFormattedParams(arguments));
			} else {
				console[arguments[0]](toJsonString(arguments));
			}
		}
	};

	var shouldLog = function (level, category) {

		/* _this in the document always refer to the logger library object */
		if (_this.logTypes["none"]) {
			return false;
		}

		if (_this.logTypes["all"]) {
			return true;
		}

		var requestLevel = _this.levels.indexOf(level);
		var minLevel = _this.levels.indexOf(_this.logTypes[category]);

		if (requestLevel == -1 || minLevel == -1) {
			return false;
		}

		if (requestLevel >= minLevel) {
			return true;
		} else {
			return false;
		}
	};

	var setlogTypes = function(logTypes) {
		_this.logTypes = logTypes;
	};

	var getlogTypes = function() {
		return _this.logTypes;
	};

	var __toObject = function(value) {
		if (value == null) throw TypeError();
		return Object(value);
	};

	var enable = function (enable) {
		_this.logTypes["none"] = ! enable;
	};

	var isColorSupported = function() {
		var ua = window.navigator.userAgent;
		var msie = ua.indexOf("MSIE ");

		if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
			// Internet explorer browser, so color is not supported
			return false;
		} else {
			return true;
		}
	};

	var toJsonString = function(obj) {
			var jsonString = "";
			try {
				jsonString = JSON.stringify(arguments);
			}
			catch(err) {
				jsonString = "JSON not supported by this browser";
			}
			return jsonString;
	};

	var getStack = function () { // looked up at http://stackoverflow.com/questions/4671031/print-function-log-stack-trace-for-entire-program-using-firebug
		var callstack = [];
		var isCallstackPopulated = false;
		var lines, i, len;
		try {
			// It will throw an error, so that we can catch below
			i.dont.exist += 0;
		} catch (e) {
			if (e.stack) { //Firefox / chrome
				lines = e.stack.split('\n');
				// lines[4] has the original calling line
				callstack.push(lines[4]);
				isCallstackPopulated = true;
			}
		}
		if (!isCallstackPopulated) { //IE and Safari
			var currentFunction = arguments.callee.caller; // This is violation of strict mode of ES5, but the use case is valid
			var fn;
			var fname;
			while (currentFunction) {
				fn = currentFunction.toString();
				fname = fn.substring(fn.indexOf("function") + 8, fn.indexOf("(")) || "anonymous";
				callstack.push(fname);
				currentFunction = currentFunction.caller;
			}
		}
		return callstack;
	};

	enable(logConfig.enableLog); // Don't show logs if configuration prohibits
	setlogTypes(logConfig.logTypes);

	window.logger = {
		enable: enable,
		setlogTypes: setlogTypes,
		getlogTypes: getlogTypes,
		log: log
	};

})();