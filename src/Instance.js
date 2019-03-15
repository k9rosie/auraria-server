import Ticker from './ticker/Ticker';

export default class Instance {
    constructor(namespace, map, ecsWorld, tickrate = 20) {
        this.namespace = namespace;
        this.map = map;
        this.tickrate = tickrate;
        this.ecsWorld = ecsWorld;
        this.ticker = new Ticker(this.tickrate);
        this.ticker.add(this.ecsWorld.tick, this.ecsWorld);
    }

    start(prestart = () => {}) {
        prestart.bind(this).call();
        this.ticker.start();
    }

    on(event, callback) {
        this.namespace.on(event, callback);
    }

    emit(event) {
        this.namespace.emit(event);
    }
}