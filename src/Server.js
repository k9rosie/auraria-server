import {createServer} from "http";
import socketio from "socket.io";
import InstanceManager from './InstanceManager';

/**
 * Centralized class for all server actions and events
 * @constructor
 * @params {object} opts - Server options
 */
export default class Server {
    constructor(opts) {
        let options = {
            ip: '127.0.0.1',
            port: 8080,
            instanceManager: true,
            socketOpts: {},
            httpOpts: {},
            ...opts
        };

        this.ip = options.ip;
        this.port = options.port;
        this.socketOpts = options.socketOpts;
        this.httpOpts = options.httpOpts;
        this.instanceManager = options.instanceManager ? new InstanceManager() : undefined;
        this.http = createServer(this.httpOpts);
        this.socket = socketio(this.http, this.socketOpts);
    }

    /**
     * Bind HTTP server to port and IP address and start listening for connections
     */
    listen() {
        this.http.listen(this.port, this.ip);
        console.log(`listening on ${this.ip}:${this.port}`);
    }

    /**
     * Shorthand for calling socket.on
     * @param event {string} - The name of the event
     * @param callback {function} - The event callback
     */
    on(event, callback) {
        this.socket.on(event, callback);
    }

    /**
     * Shorthand for calling socket.emit. This will emit the event to every connected socket.
     * @param event {string} - The name of the event
     */
    emit(event) {
        this.socket.emit(event);
    }
    
    joinInstance(socket, instance) {
        
    }
}