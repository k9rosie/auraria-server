export default class Command {
    constructor(fn, context) {
        this.fn = fn;
        this.context = context;
    }
}