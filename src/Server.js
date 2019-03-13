import path from 'path';
import Assets from "./Assets";
import {createServer} from "http";
import socketio from "socket.io";

export default class Server {
    constructor(opts) {
        let options = {
            ip: '127.0.0.1',
            port: 8080,
            assetsDir: path.join(__dirname, '/assets'),
            ...opts
        };

        this.ip = options.ip;
        this.port = options.port;
        this.assetDir = options.assetsDir;

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