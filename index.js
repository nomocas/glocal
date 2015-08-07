/**
 * glocal : standard Promise A+ with glocal context management.
 *
 * Yet another PromiseA+ implementation.
 * 
 * Based on Bram Stein implementation (https://github.com/bramstein/promis).
 * 
 * Version changes : 
 * 
 * - AMD/CommonJS/Global 
 * - glocal context
 * - log familly API
 * - remove polyfill
 * 
 * It has been developed to have PromiseA+ compliant tools that manage "glocal context" pattern.
 * So small pattern, but so powerful...
 */
(function(define) {
	"use strict";
	define([], function() {

		var queue = [];
		var async = function(callback) {
			queue.push(callback);
			if (queue.length === 1) {
				async.async();
			}
		};
		async.run = function() {
			while (queue.length) {
				queue[0]();
				queue.shift();
			}
		};
		async.async = function() {
			setTimeout(async.run, 0);
		};

		/**
		 * Create a new Promise.
		 *
		 * @param {function(function(*),function(*))} executor
		 * @constructor
		 */
		var Promise = function Promise(executor) {
			this.state = Promise.State.PENDING;
			this.value = undefined;
			this.deferred = [];

			//_____________________________________ context CATCH
			this.context = Promise.context;
			//_____________________________________ END context CATCH

			var promise = this;

			try {
				executor(function(x) {
					promise.resolve(x);
				}, function(r) {
					promise.reject(r);
				});
			} catch (e) {
				promise.reject(e);
			}
		};

		Promise.State = {
			RESOLVED: 0,
			REJECTED: 1,
			PENDING: 2
		};

		/**
		 * Create a rejected Promise.
		 * @param {*} r The reason for rejection.
		 * @return {!Promise}
		 */
		Promise.reject = function(r) {
			return new Promise(function(resolve, reject) {
				reject(r);
			});
		};

		/**
		 * Create a resolved Promise.
		 * @param {*} x The value to resolve the Promise with.
		 * @return {!Promise}
		 */
		Promise.resolve = function(x) {
			return new Promise(function(resolve, reject) {
				resolve(x);
			});
		};

		/**
		 * Resolve this Promise.
		 * @param {*} x The value to resolve the Promise with.
		 * @private
		 */
		Promise.prototype.resolve = function(x) {
			var promise = this;

			if (promise.state === Promise.State.PENDING) {
				if (x === promise) {
					throw new TypeError('Promise settled with itself.');
				}

				var called = false;

				try {
					var then = x && x.then;

					if (x !== null && typeof x === 'object' && typeof then === 'function') {
						then.call(x, function(x) {
							if (!called) {
								promise.resolve(x);
							}
							called = true;
						}, function(r) {
							if (!called) {
								promise.reject(r);
							}
							called = true;
						});
						return;
					}
				} catch (e) {
					if (!called) {
						promise.reject(e);
					}
					return;
				}
				promise.state = Promise.State.RESOLVED;
				promise.value = x;
				promise.notify();
			}
		};

		/**
		 * Reject this Promise.
		 * @private
		 * @param {*} reason The reason for rejection.
		 */
		Promise.prototype.reject = function(reason) {
			var promise = this;

			if (promise.state === Promise.State.PENDING) {
				if (reason === promise) {
					throw new TypeError('Promise settled with itself.');
				}

				promise.state = Promise.State.REJECTED;
				promise.value = reason;
				promise.notify();
			}
		};

		/**
		 * Notify all handlers of a change in state.
		 * @private
		 */
		Promise.prototype.notify = function() {
			var promise = this;
			async(function() {
				if (promise.state !== Promise.State.PENDING) {
					while (promise.deferred.length) {
						var deferred = promise.deferred.shift(),
							onResolved = deferred[0],
							onRejected = deferred[1],
							target = deferred[2],
							r;
						try {
							if (promise.state === Promise.State.RESOLVED) {
								if (typeof onResolved === 'function') {
									r = onResolved.call(undefined, promise.value);
									target.context = promise.context;
									target.resolve(r);
								} else
									target.resolve(promise.value);
							} else if (promise.state === Promise.State.REJECTED) {
								if (typeof onRejected === 'function') {
									r = onRejected.call(undefined, promise.value);
									target.context = promise.context;
									target.resolve(r);
								} else
									target.reject(promise.value);
							}
						} catch (e) {
							if (Promise.debug || (Promise.context && Promise.context.debug))
								console.error('error : ', e, e.stack);
							target.reject(e);
						}
					}
				}
			});
		};

		/**
		 * @param {Array.<!Promise>} iterable
		 * @return {!Promise}
		 */
		Promise.all = function(iterable) {
			return new Promise(function(resolve, reject) {
				var count = 0,
					result = [];

				if (iterable.length === 0) {
					resolve(result);
				}

				function resolver(i) {
					return function(x) {
						result[i] = x;
						count += 1;

						if (count === iterable.length) {
							resolve(result);
						}
					};
				}

				for (var i = 0; i < iterable.length; i += 1) {
					iterable[i].then(resolver(i), reject);
				}
			});
		};

		/**
		 * @param {Array.<!Promise>} iterable
		 * @return {!Promise}
		 */
		Promise.race = function(iterable) {
			return new Promise(function(resolve, reject) {
				for (var i = 0; i < iterable.length; i += 1) {
					iterable[i].then(resolve, reject);
				}
			});
		};

		/**
		 * @param {function(*):*} onRejected Called when this Promise is rejected.
		 * @return {!Promise}
		 */
		Promise.prototype["catch"] = function(onRejected) {
			return this.then(undefined, (onRejected ? swapper(onRejected, this) : onRejected));
		};

		/**
		 * @param {function(*):*=} onResolved Called when this Promise is resolved.
		 * @param {function(*):*=} onRejected Called when this Promise is rejected.
		 * @return {!Promise}
		 */
		Promise.prototype.then = function(onResolved, onRejected) {
			var self = this;
			var target = new Promise(function(resolve, reject) {
				self.notify();
			});
			this.deferred.push([(onResolved ? swapper(onResolved, this) : onResolved), (onRejected ? swapper(onRejected, this) : onRejected), target]);
			return target;
		};

		//_____________________________________ WHEN

		Promise.when = function(something) {
			if (something && typeof something.then === 'function')
				return something;
			if (something instanceof Error)
				return Promise.reject(something);
			return Promise.resolve(something);
		};
		//_____________________________________ GLOCALIZE
		// ________________________________ context SWAPPER


		/**
		 * First context
		 * @type {Object}
		 */
		Promise.context = {};

		/**
		 * context swapper as a wrapper for then/catch callback
		 * @private
		 * @param  {Function} callback    the callback to wrap
		 * @param  {Promise} promise the promise from where to take the context
		 * @return {Function}       the final wrapper
		 */
		function swapper(callback, promise) {
			return function ctxSwap() {
				var previous = Promise.context;
				Promise.context = promise.context;
				var r = callback.apply(this, arguments);
				Promise.context = previous;
				return r;
			};
		}

		function _glocalize(ctx, key, value) {
			if (!ctx)
				return {};
			var context = {};
			// shallow copy
			for (var i in ctx)
				context[i] = ctx[i];
			if (!key)
				return context;
			if (typeof key === 'object')
				for (var j in key)
					context[j] = key[j];
			else
				context[key] = value;
			return context;
		}
		Promise._glocalize = _glocalize;

		Promise.prototype.glocalize = function(key, value) {
			var self = this;
			return this.then(function(s) {
				self.context = _glocalize(self.context, key, value);
				return s;
			});
		};

		//___________________________________________________ MODES

		Promise.prototype.modes = function(key, value) {
			var self = this;
			return this.then(function(s) {
				var modes = {},
					ctx = self.context;
				for (var i in ctx.modes) {
					var m = ctx.modes[i];
					modes[i] = (m && m.forEach) ? m.slice() : m;
				}
				if (!value && typeof key === 'object')
					for (var j in key)
						modes[j] = key[j];
				else
					modes[key] = value;
				self.context = _glocalize(self.context, "modes", modes);
				return s;
			});
		};
		//___________________________________________________ DEBUG AND LOG


		function getLogger() {
			return (Promise.context && Promise.context.logger) || Promise.logger || console;
		}

		Promise.prototype.delay = function(ms) {
			return this.then(function(s) {
				return new Promise(function(resolve, reject) {
					setTimeout(function() {
						resolve(s);
					}, ms);
				});
			});
		};
		Promise.prototype.clog = function(key) {
			return this.then(function(s) {
				var c = getLogger();
				c.log.call(c, key ? Promise.context[key] : Promise.context);
				return s;
			});
		};
		Promise.prototype.elog = function() {
			var args = arguments;
			return this.then(undefined, function(e) {
				args = Array.prototype.slice.call(args);
				args.push(e);
				var c = getLogger();
				c.error.apply(c, args);
				return Promise.reject(e);
			});
		};
		Promise.prototype.slog = function() {
			var args = arguments;
			return this.then(function(s) {
				args = Array.prototype.slice.call(args);
				args.push(s);
				var c = getLogger();
				c.log.apply(c, args);
				return s;
			});
		};
		Promise.prototype.log = function() {
			return this.slog.apply(this, arguments).elog.apply(this, arguments);
		};
		return {
			Promise: Promise
		};
	});
})(typeof define !== 'undefined' ? define : function(deps, factory) { // AMD/RequireJS format if available
	if (typeof module !== 'undefined')
		module.exports = factory(); // CommonJS environment
	else if (typeof window !== 'undefined')
		window.glocal = factory(); // raw script, assign to c3po global
	else
		console.warn("glocal hasn't been mounted somewhere.");
});
