import Instance from './Instance';
import Protocol from './protocol';
import loki from 'lokijs';

/**
 * A helper class to manage instances
 */
export default class InstanceManager {
    constructor(server) {
        this.server = server;
        this.instances = {};
        this.connectedSockets = new loki('sockets');
    }
    
    newInstance(map, world, tickrate = 20) {
        let instance = new Instance(map, world, tickrate);
        instance.room = this.server.socket.to(instance.id);
        this.instances[instance.id] = instance;
        return instance.id;
    }
    
    startInstances() {
        Object.values(this.instances).forEach(instance => {
            instance.start();
        });
    }

    joinInstance(socket, instanceId) {
        let instance = this.instances[instanceId];
        socket.emit(Protocol.map(socket, instance.map));
    }
}