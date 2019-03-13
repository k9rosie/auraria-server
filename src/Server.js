import path from 'path';
import Assets from "./Assets";
import {createServer} from "http";
import socketio from "socket.io";

export default class Server {
    constructor(opts) {
        this.ip = (opts !== undefined)? opts.ip : '127.0.0.1';
        this.port = (opts !== undefined)? opts.port : '8080';
        this.assetDir = (opts !== undefined)? opts.assetsDir : path.join(__dirname, '/assets');
        this.assets = new Assets(this.assetDir);
        this.http = createServer();
        this.socket = socketio(this.http);
    }

    loadAssets() {
        this.assets.loadMaps();
        this.assets.loadTilesheets();
    }

    init() {
        this.loadAssets();
        this.http.listen(this.ip, this.port);
        console.log(`listening on ${this.ip}:${this.port}`);
    }
}