import Ticker from './ticker/Ticker';
import uuidv4 from 'uuid';

export default class Instance {
    constructor(map, ecsWorld, tickrate = 20) {
        this.id = uuidv4();
        this.map = map;
        this.tickrate = tickrate;
        this.ecsWorld = ecsWorld;
        this.ticker = new Ticker(this.tickrate);
        this.ticker.add(this.ecsWorld.tick, this.ecsWorld);
        this.connectedSockets = [];
    }

    start(prestart = () => {}) {
        prestart.bind(this).call();
        this.ticker.start();
    }
}