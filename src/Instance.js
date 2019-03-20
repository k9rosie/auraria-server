import Ticker from './ticker/Ticker';
import uuidv4 from 'uuid';
import Protocol from "./protocol";

export default class Instance {
    constructor(map, ecsWorld, tickrate = 20) {
        this.id = uuidv4();
        this.map = map;
        this.tickrate = tickrate;
        this.ecsWorld = ecsWorld;
        this.ticker = new Ticker(this.tickrate);
        this.room = {}; // this is set in an InstanceManager newInstance call
    }

    start(prestart = () => {}) {
        prestart.call(this);

        this.ticker.add(this.ecsWorld.tick, this.ecsWorld);

        // add function to broadcast update packets every tick
        this.ticker.add(Protocol.update(this.room, this.ecsWorld.changes));

        this.ticker.start();
    }
}