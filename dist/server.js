'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var uuidv4 = _interopDefault(require('uuid'));
var loki = _interopDefault(require('lokijs'));
var http = require('http');
var socketio = _interopDefault(require('socket.io'));
var pako = _interopDefault(require('pako'));
var fs = _interopDefault(require('fs'));
var path = _interopDefault(require('path'));
var readline = require('readline');

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

/*
    this code is literally just stolen from the Pixi.js ticker library because im a lazy asshole
    you can see the original code here: https://github.com/pixijs/pixi.js/blob/dev/src/core/ticker/Ticker.js
    their license (MIT) states that we have to include this copyright notice, so here it is:

    The MIT License

    Copyright (c) 2013-2017 Mathew Groves, Chad Engler

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.
 */

var Action = function () {
    /**
     * Constructor
     *
     * @param {Function} fn - The listener function to be added for one update
     * @param {Function} [context=null] - The listener context
     * @param {number} [priority=0] - The priority for emitting
     * @param {boolean} [once=false] - If the handler should fire once
     */
    function Action(fn) {
        var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var priority = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
        var once = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
        classCallCheck(this, Action);

        /**
         * The handler function to execute.
         * @member {Function}
         */
        this.fn = fn;

        /**
         * The calling to execute.
         * @member {Function}
         */
        this.context = context;

        /**
         * The current priority.
         * @member {number}
         */
        this.priority = priority;

        /**
         * If this should only execute once.
         * @member {boolean}
         */
        this.once = once;

        /**
         * The next item in chain.
         * @member {TickerListener}
         */
        this.next = null;

        /**
         * The previous item in chain.
         * @member {TickerListener}
         */
        this.previous = null;

        /**
         * `true` if this listener has been destroyed already.
         * @member {boolean}
         * @private
         */
        this._destroyed = false;
    }

    /**
     * Simple compare function to figure out if a function and context match.
     *
     * @param {Function} fn - The listener function to be added for one update
     * @param {Function} context - The listener context
     * @return {boolean} `true` if the listener match the arguments
     */


    Action.prototype.match = function match(fn, context) {
        context = context || null;

        return this.fn === fn && this.context === context;
    };

    /**
     * Emit by calling the current function.
     * @param {number} deltaTime - time since the last emit.
     * @return {TickerListener} Next ticker
     */


    Action.prototype.emit = function emit(deltaTime) {
        if (this.fn) {
            if (this.context) {
                this.fn.call(this.context, deltaTime);
            } else {
                this.fn(deltaTime);
            }
        }

        var redirect = this.next;

        if (this.once) {
            this.destroy(true);
        }

        // Soft-destroying should remove
        // the next reference
        if (this._destroyed) {
            this.next = null;
        }

        return redirect;
    };

    /**
     * Connect to the list.
     * @param {TickerListener} previous - Input node, previous listener
     */


    Action.prototype.connect = function connect(previous) {
        this.previous = previous;
        if (previous.next) {
            previous.next.previous = this;
        }
        this.next = previous.next;
        previous.next = this;
    };

    /**
     * Destroy and don't use after this.
     * @param {boolean} [hard = false] `true` to remove the `next` reference, this
     *        is considered a hard destroy. Soft destroy maintains the next reference.
     * @return {TickerListener} The listener to redirect while emitting or removing.
     */


    Action.prototype.destroy = function destroy() {
        var hard = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

        this._destroyed = true;
        this.fn = null;
        this.context = null;

        // Disconnect, hook up next and previous
        if (this.previous) {
            this.previous.next = this.next;
        }

        if (this.next) {
            this.next.previous = this.previous;
        }

        // Redirect to the next item
        var redirect = this.next;

        // Remove references
        this.next = hard ? null : redirect;
        this.previous = null;

        return redirect;
    };

    return Action;
}();

/*
    this code is literally just stolen from the Pixi.js ticker library because im a lazy asshole
    you can see the original code here: https://github.com/pixijs/pixi.js/blob/dev/src/core/ticker/Ticker.js
    their license (MIT) states that we have to include this copyright notice, so here it is:

    The MIT License

    Copyright (c) 2013-2017 Mathew Groves, Chad Engler

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.
 */

var _require = require('perf_hooks'),
    performance = _require.performance;

var UPDATE_PRIORITY = {
    INTERACTION: 50,
    HIGH: 25,
    NORMAL: 0,
    LOW: -25,
    UTILITY: -50
};

var Ticker = function () {
    function Ticker() {
        var _this = this;

        var tickRate = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 20;
        classCallCheck(this, Ticker);

        this.tickRate = tickRate;
        this._timeout = null;
        /**
         * The first listener. All new listeners added are chained on this.
         * @private
         * @type {TickerListener}
         */
        this._head = new Action(null, null, Infinity);

        /**
         * Internal value managed by minFPS property setter and getter.
         * This is the maximum allowed milliseconds between updates.
         * @private
         */
        this._maxElapsedMS = 100;

        /**
         * Whether or not this ticker should invoke the method
         * {@link PIXI.ticker.Ticker#start} automatically
         * when a listener is added.
         *
         * @member {boolean}
         * @default false
         */
        this.autoStart = false;

        /**
         * Scalar time value from last frame to this frame.
         * This value is capped by setting {@link PIXI.ticker.Ticker#minFPS}
         * and is scaled with {@link PIXI.ticker.Ticker#speed}.
         * **Note:** The cap may be exceeded by scaling.
         *
         * @member {number}
         * @default 1
         */
        this.deltaTime = 1;

        /**
         * Time elapsed in milliseconds from last frame to this frame.
         * Opposed to what the scalar {@link PIXI.ticker.Ticker#deltaTime}
         * is based, this value is neither capped nor scaled.
         * If the platform supports DOMHighResTimeStamp,
         * this value will have a precision of 1 µs.
         * Defaults to target frame time
         *
         * @member {number}
         * @default 16.66
         */
        this.elapsedMS = 1 / (this.tickRate / 1000);

        /**
         * The last time {@link PIXI.ticker.Ticker#update} was invoked.
         * This value is also reset internally outside of invoking
         * update, but only when a new animation frame is requested.
         * If the platform supports DOMHighResTimeStamp,
         * this value will have a precision of 1 µs.
         *
         * @member {number}
         * @default -1
         */
        this.lastTime = -1;

        /**
         * Factor of current {@link PIXI.ticker.Ticker#deltaTime}.
         * @example
         * // Scales ticker.deltaTime to what would be
         * // the equivalent of approximately 120 FPS
         * ticker.speed = 2;
         *
         * @member {number}
         * @default 1
         */
        this.speed = 1;

        /**
         * Whether or not this ticker has been started.
         * `true` if {@link PIXI.ticker.Ticker#start} has been called.
         * `false` if {@link PIXI.ticker.Ticker#stop} has been called.
         * While `false`, this value may change to `true` in the
         * event of {@link PIXI.ticker.Ticker#autoStart} being `true`
         * and a listener is added.
         *
         * @member {boolean}
         * @default false
         */
        this.started = false;

        /**
         * Internal tick method bound to ticker instance.
         * This is because in early 2015, Function.bind
         * is still 60% slower in high performance scenarios.
         * Also separating frame requests from update method
         * so listeners may be called at any time and with
         * any animation API, just invoke ticker.update(time).
         *
         * @private
         * @param {number} time - Time since last tick.
         */
        this._tick = function (time) {
            _this._timeout = null;

            if (_this.started) {
                // Invoke listeners now
                _this.update(time);
                // Listener side effects may have modified ticker state.
                if (_this.started && _this._timeout === null && _this._head.next) {
                    _this._timeout = setTimeout(_this._tick, 1 / (_this.tickRate / 1000));
                }
            }
        };
    }

    /**
     * Conditionally requests a new animation frame.
     * If a frame has not already been requested, and if the internal
     * emitter has listeners, a new frame is requested.
     *
     * @private
     */


    Ticker.prototype._requestIfNeeded = function _requestIfNeeded() {
        if (this._timeout === null && this._head.next) {
            // ensure callbacks get correct delta
            this.lastTime = performance.now();
            this._timeout = setTimeout(this._tick, 1 / (this.tickRate / 1000));
        }
    };

    /**
     * Conditionally cancels a pending animation frame.
     *
     * @private
     */


    Ticker.prototype._cancelIfNeeded = function _cancelIfNeeded() {
        if (this._timeout !== null) {
            clearTimeout(this._timeout);
            this._timeout = null;
        }
    };

    /**
     * Conditionally requests a new animation frame.
     * If the ticker has been started it checks if a frame has not already
     * been requested, and if the internal emitter has listeners. If these
     * conditions are met, a new frame is requested. If the ticker has not
     * been started, but autoStart is `true`, then the ticker starts now,
     * and continues with the previous conditions to request a new frame.
     *
     * @private
     */


    Ticker.prototype._startIfPossible = function _startIfPossible() {
        if (this.started) {
            this._requestIfNeeded();
        } else if (this.autoStart) {
            this.start();
        }
    };

    /**
     * Register a handler for tick events. Calls continuously unless
     * it is removed or the ticker is stopped.
     *
     * @param {Function} fn - The listener function to be added for updates
     * @param {Function} [context] - The listener context
     * @param {number} [priority=PIXI.UPDATE_PRIORITY.NORMAL] - The priority for emitting
     * @returns {PIXI.ticker.Ticker} This instance of a ticker
     */


    Ticker.prototype.add = function add(fn, context) {
        var priority = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : UPDATE_PRIORITY.NORMAL;

        return this._addListener(new Action(fn, context, priority));
    };

    /**
     * Add a handler for the tick event which is only execute once.
     *
     * @param {Function} fn - The listener function to be added for one update
     * @param {Function} [context] - The listener context
     * @param {number} [priority=PIXI.UPDATE_PRIORITY.NORMAL] - The priority for emitting
     * @returns {PIXI.ticker.Ticker} This instance of a ticker
     */


    Ticker.prototype.addOnce = function addOnce(fn, context) {
        var priority = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : UPDATE_PRIORITY.NORMAL;

        return this._addListener(new Action(fn, context, priority, true));
    };

    /**
     * Internally adds the event handler so that it can be sorted by priority.
     * Priority allows certain handler (user, AnimatedSprite, Interaction) to be run
     * before the rendering.
     *
     * @private
     * @param {TickerListener} listener - Current listener being added.
     * @returns {PIXI.ticker.Ticker} This instance of a ticker
     */


    Ticker.prototype._addListener = function _addListener(action) {
        // For attaching to head
        var current = this._head.next;
        var previous = this._head;

        // Add the first item
        if (!current) {
            action.connect(previous);
        } else {
            // Go from highest to lowest priority
            while (current) {
                if (action.priority > current.priority) {
                    action.connect(previous);
                    break;
                }
                previous = current;
                current = current.next;
            }

            // Not yet connected
            if (!action.previous) {
                action.connect(previous);
            }
        }

        this._startIfPossible();

        return this;
    };

    /**
     * Removes any handlers matching the function and context parameters.
     * If no handlers are left after removing, then it cancels the animation frame.
     *
     * @param {Function} fn - The listener function to be removed
     * @param {Function} [context] - The listener context to be removed
     * @returns {PIXI.ticker.Ticker} This instance of a ticker
     */


    Ticker.prototype.remove = function remove(fn, context) {
        var action = this._head.next;

        while (action) {
            // We found a match, lets remove it
            // no break to delete all possible matches
            // incase a listener was added 2+ times
            if (action.match(fn, context)) {
                action = action.destroy();
            } else {
                action = action.next;
            }
        }

        if (!this._head.next) {
            this._cancelIfNeeded();
        }

        return this;
    };

    /**
     * Starts the ticker. If the ticker has listeners
     * a new animation frame is requested at this point.
     */


    Ticker.prototype.start = function start() {
        if (!this.started) {
            this.started = true;
            this._requestIfNeeded();
        }
    };

    /**
     * Stops the ticker. If the ticker has requested
     * an animation frame it is canceled at this point.
     */


    Ticker.prototype.stop = function stop() {
        if (this.started) {
            this.started = false;
            this._cancelIfNeeded();
        }
    };

    /**
     * Destroy the ticker and don't use after this. Calling
     * this method removes all references to internal events.
     */


    Ticker.prototype.destroy = function destroy() {
        this.stop();

        var action = this._head.next;

        while (action) {
            action = action.destroy(true);
        }

        this._head.destroy();
        this._head = null;
    };

    /**
     * Triggers an update. An update entails setting the
     * current {@link PIXI.ticker.Ticker#elapsedMS},
     * the current {@link PIXI.ticker.Ticker#deltaTime},
     * invoking all listeners with current deltaTime,
     * and then finally setting {@link PIXI.ticker.Ticker#lastTime}
     * with the value of currentTime that was provided.
     * This method will be called automatically by animation
     * frame callbacks if the ticker instance has been started
     * and listeners are added.
     *
     * @param {number} [currentTime=performance.now()] - the current time of execution
     */


    Ticker.prototype.update = function update() {
        var currentTime = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : performance.now();

        var elapsedMS = void 0;

        // If the difference in time is zero or negative, we ignore most of the work done here.
        // If there is no valid difference, then should be no reason to let anyone know about it.
        // A zero delta, is exactly that, nothing should update.
        //
        // The difference in time can be negative, and no this does not mean time traveling.
        // This can be the result of a race condition between when an animation frame is requested
        // on the current JavaScript engine event loop, and when the ticker's start method is invoked
        // (which invokes the internal _requestIfNeeded method). If a frame is requested before
        // _requestIfNeeded is invoked, then the callback for the animation frame the ticker requests,
        // can receive a time argument that can be less than the lastTime value that was set within
        // _requestIfNeeded. This difference is in microseconds, but this is enough to cause problems.
        //
        // This check covers this browser engine timing issue, as well as if consumers pass an invalid
        // currentTime value. This may happen if consumers opt-out of the autoStart, and update themselves.

        if (currentTime > this.lastTime) {
            // Save uncapped elapsedMS for measurement
            elapsedMS = this.elapsedMS = currentTime - this.lastTime;

            // cap the milliseconds elapsed used for deltaTime
            if (elapsedMS > this._maxElapsedMS) {
                elapsedMS = this._maxElapsedMS;
            }

            this.deltaTime = elapsedMS * (this.tickRate / 1000) * this.speed;

            // Cache a local reference, in-case ticker is destroyed
            // during the emit, we can still check for head.next
            var head = this._head;

            // Invoke listeners added to internal emitter
            var action = head.next;

            while (action) {
                action = action.emit(this.deltaTime);
            }

            if (!head.next) {
                this._cancelIfNeeded();
            }
        } else {
            this.deltaTime = this.elapsedMS = 0;
        }

        this.lastTime = currentTime;
    };

    /**
     * The frames per second at which this ticker is running.
     * The default is approximately 60 in most modern browsers.
     * **Note:** This does not factor in the value of
     * {@link PIXI.ticker.Ticker#speed}, which is specific
     * to scaling {@link PIXI.ticker.Ticker#deltaTime}.
     *
     * @member {number}
     * @readonly
     */


    createClass(Ticker, [{
        key: 'TPS',
        get: function get$$1() {
            return 1000 / this.elapsedMS;
        }

        /**
         * Manages the maximum amount of milliseconds allowed to
         * elapse between invoking {@link PIXI.ticker.Ticker#update}.
         * This value is used to cap {@link PIXI.ticker.Ticker#deltaTime},
         * but does not effect the measured value of {@link PIXI.ticker.Ticker#FPS}.
         * When setting this property it is clamped to a value between
         * `0` and `PIXI.settings.TARGET_FPMS * 1000`.
         *
         * @member {number}
         * @default 10
         */

    }, {
        key: 'minTPS',
        get: function get$$1() {
            return 1000 / this._maxElapsedMS;
        },
        set: function set$$1(tps) // eslint-disable-line require-jsdoc
        {
            // Clamp: 0 to TARGET_FPMS
            var minTPMS = Math.min(Math.max(0, tps) / 1000, this.tickRate / 1000);

            this._maxElapsedMS = 1 / minTPMS;
        }
    }]);
    return Ticker;
}();

var Instance = function () {
    function Instance(map, ecsWorld) {
        var tickrate = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 20;
        classCallCheck(this, Instance);

        this.id = uuidv4();
        this.map = map;
        this.tickrate = tickrate;
        this.ecsWorld = ecsWorld;
        this.ticker = new Ticker(this.tickrate);
        this.ticker.add(this.ecsWorld.tick, this.ecsWorld);
        this.connectedSockets = [];
    }

    Instance.prototype.start = function start() {
        var prestart = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};

        prestart.bind(this).call();
        this.ticker.start();
    };

    return Instance;
}();

var Protocol = {
    join: function join(socket, map, entities) {
        socket.emit('join', {
            map: map,
            entities: entities
        });
    },

    update: function update(socket, changes) {
        socket.emit('update', {
            changes: changes
        });
    },

    tilesheet: function tilesheet(socket, _tilesheet) {
        socket.emit('tilesheet', {
            data: _tilesheet
        });
    }
};

/**
 * A helper class to manage instances
 */

var InstanceManager = function () {
    function InstanceManager(server) {
        classCallCheck(this, InstanceManager);

        this.server = server;
        this.instances = {};
        this.connectedSockets = new loki('sockets');
    }

    InstanceManager.prototype.newInstance = function newInstance(map, world) {
        var tickrate = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 20;

        var instance = new Instance(map, world, tickrate);
        instance.room = this.server.socket.to(instance.id);
        this.instances[instance.id] = instance;
        return instance.id;
    };

    InstanceManager.prototype.startInstances = function startInstances() {
        Object.values(this.instances).forEach(function (instance) {
            instance.start();
        });
    };

    InstanceManager.prototype.joinInstance = function joinInstance(socket, instanceId) {
        var instance = this.instances[instanceId];
        socket.emit(Protocol.map(socket, instance.map));
    };

    return InstanceManager;
}();

/**
 * Centralized class for all server actions and events
 * @constructor
 * @params {object} opts - Server options
 */

var Server = function () {
    function Server(opts) {
        classCallCheck(this, Server);

        var options = _extends({
            ip: '127.0.0.1',
            port: 8080,
            instanceManager: true,
            socketOpts: {},
            httpOpts: {}
        }, opts);

        this.ip = options.ip;
        this.port = options.port;
        this.socketOpts = options.socketOpts;
        this.httpOpts = options.httpOpts;
        this.instanceManager = options.instanceManager ? new InstanceManager() : undefined;
        this.http = http.createServer(this.httpOpts);
        this.socket = socketio(this.http, this.socketOpts);
    }

    /**
     * Bind HTTP server to port and IP address and start listening for connections
     */


    Server.prototype.listen = function listen() {
        this.http.listen(this.port, this.ip);
        console.log("listening on " + this.ip + ":" + this.port);
    };

    /**
     * Shorthand for calling socket.on
     * @param event {string} - The name of the event
     * @param callback {function} - The event callback
     */


    Server.prototype.on = function on(event, callback) {
        this.socket.on(event, callback);
    };

    /**
     * Shorthand for calling socket.emit. This will emit the event to every connected socket.
     * @param event {string} - The name of the event
     */


    Server.prototype.emit = function emit(event) {
        this.socket.emit(event);
    };

    return Server;
}();

var Utils = {
    truncateFileExtension: function truncateFileExtension(fileName) {
        return fileName.replace(/\.[^/.]+$/, "");
    }
};

/**
 * Represents a tilesheet. Includes image data in uncompressed base64 and the JSON data associated with it
 * @constructor
 * @param {string} img - The image data encoded in base64
 * @param {object} data - The tilesheet data
 */

var Tilesheet = function () {
    function Tilesheet(name, img, data) {
        classCallCheck(this, Tilesheet);

        this.name = name;
        this.img = img; // image data in uncompressed base64 format
        this.data = data;
    }

    /**
     * Serializes this object into JSON then compresses it with pako (zlib)
     * and returns the base64 encoded string.
     * @returns {string} - Returns compressed JSON encoded in base64
     */


    Tilesheet.prototype.package = function _package() {
        var serialized = JSON.stringify(this);
        var compressed = pako.deflate(serialized, { to: 'string' });
        return Buffer.from(compressed).toString('base64');
    };

    return Tilesheet;
}();

/**
 * Centralized object where map and tilesheet assets are stored.
 * @constructor
 * @param {string} - The full complete path to the assets directory
 */

var Assets = function () {
    function Assets(assetsDir) {
        classCallCheck(this, Assets);

        this.dirs = {
            maps: path.join(assetsDir, '/maps'),
            tilesheets: {
                img: path.join(assetsDir, '/tilesheets/img'),
                json: path.join(assetsDir, '/tilesheets/json')
            }
        };
        this.maps = {};
        this.tilesheets = {};
    }

    /**
     * Loads map and tilesheet files in one function
     */


    Assets.prototype.load = function load() {
        this.loadMaps();
        this.loadTilesheets();
    };

    /**
     * Loads all map files in one function
     */


    Assets.prototype.loadMaps = function loadMaps() {
        var _this = this;

        fs.readdirSync(this.dirs.maps).forEach(function (fileName) {
            var p = path.join(_this.dirs.maps, fileName);
            _this.maps[fileName] = Assets.map(p);
        });
    };

    /**
     * Read a map
     * @static
     * @param {string} mapPath - The full path to the map file
     * @returns {object} - Parsed JS object from the map JSON
     */


    Assets.map = function map(mapPath) {
        var buf = fs.readFileSync(mapPath);
        return JSON.parse(buf.toString('utf-8'));
    };

    /**
     * Loads all tilesheet files in one function.
     */


    Assets.prototype.loadTilesheets = function loadTilesheets() {
        var _this2 = this;

        fs.readdirSync(this.dirs.tilesheets.img).forEach(function (fileName) {
            var name = Utils.truncateFileExtension(fileName);
            var pathImg = path.join(_this2.dirs.tilesheets.img, fileName);
            var pathJSON = path.join(_this2.dirs.tilesheets.json, name + '.json');
            _this2.tilesheets[name] = new Tilesheet(name, Assets.tilesheet(pathImg), Assets.tilesheetData(pathJSON));
        });
    };

    /**
     * Reads tilesheet image data and returns base64 encoded image
     * @static
     * @param {string} tilesheetPath - The full path to the tilesheet image
     * @returns {string} - The base64 encoded image
     */


    Assets.tilesheet = function tilesheet(tilesheetPath) {
        var buf = fs.readFileSync(tilesheetPath);
        return buf.toString('base64');
    };

    /**
     * Parses tilesheet JSON data and returns a JS object
     * @static
     * @param {string} tilesheetDataPath - The full path to the tilesheet JSON file
     * @returns {object} - The parsed JSON file
     */


    Assets.tilesheetData = function tilesheetData(tilesheetDataPath) {
        var buf = fs.readFileSync(tilesheetDataPath);
        return JSON.parse(buf.toString('utf-8'));
    };

    return Assets;
}();

var index = {
    Action: Action,
    Ticker: Ticker
};

var Ticker$1 = /*#__PURE__*/Object.freeze({
  default: index
});

var CommandHandler = function () {
    function CommandHandler() {
        classCallCheck(this, CommandHandler);

        this.interface = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.commands = {};
    }

    CommandHandler.prototype.startReading = function startReading() {
        var _this = this;

        this.interface('Command:', function (command) {
            var split = command.split(" ");
            if (_this.commands.hasOwnProperty(command)) {
                _this.commands[split[0]].execute(split.splice(0, 1));
            } else {
                console.error('Command ' + split[0] + ' doesn\'t exist');
            }
        });
    };

    return CommandHandler;
}();

var Command = function () {
    function Command(command, fn, context) {
        classCallCheck(this, Command);

        this.fn = fn;
        this.context = context;
    }

    Command.prototype.execute = function execute(args) {
        this.fn.call(this.context, args);
    };

    return Command;
}();

var index$1 = {
    Server: Server,
    Assets: Assets,
    Tilesheet: Tilesheet,
    Utils: Utils,
    Instance: Instance,
    Ticker: Ticker$1,
    InstanceManager: InstanceManager,
    Protocol: Protocol,
    CommandHandler: CommandHandler,
    Command: Command
};

module.exports = index$1;
