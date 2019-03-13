'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs = _interopDefault(require('fs'));
var path = _interopDefault(require('path'));
var http = require('http');
var socketio = _interopDefault(require('socket.io'));

var truncateFileExtension = function truncateFileExtension(fileName) {
    return fileName.replace(/\.[^/.]+$/, "");
};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

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

var Tilesheet = function () {
    function Tilesheet(img, data) {
        classCallCheck(this, Tilesheet);

        this.img = img; // image data in uncompressed base64 format
        this.data = data;
    }

    Tilesheet.prototype.package = function _package() {};

    return Tilesheet;
}();

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

    Assets.prototype.loadMaps = function loadMaps() {
        var _this = this;

        fs.readdirSync(this.dirs.maps).forEach(function (fileName) {
            var p = path.join(_this.dirs.maps, fileName);
            _this.maps[fileName] = Assets.map(p);
        });
    };

    Assets.map = function map(mapPath) {
        var buf = fs.readFileSync(mapPath);
        return JSON.parse(buf.toString('utf-8'));
    };

    Assets.prototype.loadTilesheets = function loadTilesheets() {
        var _this2 = this;

        fs.readdirSync(this.dirs.tilesheets.img).forEach(function (fileName) {
            var base = truncateFileExtension(fileName);
            var pathImg = path.join(_this2.dirs.tilesheets.img, fileName);
            var pathJSON = path.join(_this2.dirs.tilesheets.json, base + '.json');
            _this2.tilesheets[base] = new Tilesheet(Assets.tilesheet(pathImg), Assets.tilesheetData(pathJSON));
        });
    };

    Assets.tilesheet = function tilesheet(tilesheetPath) {
        var buf = fs.readFileSync(tilesheetPath);
        return buf.toString('base64');
    };

    Assets.tilesheetData = function tilesheetData(tilesheetDataPath) {
        var buf = fs.readFileSync(tilesheetDataPath);
        return JSON.parse(buf.toString('utf-8'));
    };

    return Assets;
}();

var Server = function () {
    function Server(opts) {
        classCallCheck(this, Server);

        var options = _extends({
            ip: '127.0.0.1',
            port: 8080,
            assetsDir: path.join(__dirname, '/assets')
        }, opts);

        this.ip = options.ip;
        this.port = options.port;
        this.assetDir = options.assetsDir;

        this.assets = new Assets(this.assetDir);
        this.http = http.createServer();
        this.socket = socketio(this.http);
    }

    Server.prototype.loadAssets = function loadAssets() {
        this.assets.loadMaps();
        this.assets.loadTilesheets();
    };

    Server.prototype.init = function init() {
        this.loadAssets();
        this.http.listen(this.port, this.ip);
        console.log("listening on " + this.ip + ":" + this.port);
    };

    return Server;
}();

module.exports = Server;
