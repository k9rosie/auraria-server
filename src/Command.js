export default class Command {
    constructor(fn, context) {
        this.fn = fn.bind(context);
    }
}