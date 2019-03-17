import Ticker from './ticker/Ticker';

export default class Instance {
    constructor(map, ecsWorld, tickrate = 20) {
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
}