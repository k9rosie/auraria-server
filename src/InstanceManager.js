import Instance from './Instance';
import Protocol from './protocol';

/**
 * A helper class to manage instances
 */
export default class InstanceManager {
    constructor(server) {
        this.server = server;
        this.instances = {};
        this.connectedSockets = {}; // socket id => room (instance) id
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

        if (this.connectedSockets.hasOwnProperty(socket.id)) // if they are switching instances
            socket.leave(this.connectedSockets[socket.id]);

        socket.join(instance.id);
        socket.emit(Protocol.map(socket, instance.map));
        socket.emit(Protocol.join(socket, instance.world.serializeEntities()));
        this.connectedSockets[socket.id] = instance.id;
    }
}