import Instance from './Instance';

/**
 * A helper class to manage instances
 */
export default class InstanceManager {
    constructor(server) {
        this.server = server;
        this.instances = {};
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
}