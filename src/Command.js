export default class Command {
    constructor(command, fn, context) {
        this.fn = fn;
        this.context = context;
    }

    execute(args) {
        this.fn.call(this.context, args);
    }
}