import * as readline from 'readline';

export default class CommandHandler {
    constructor() {
        this.interface = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.commands = {};
    }

    startReading() {
        this.interface.question('\n-> ', (command) => {
            let split = command.split(" ");
            if (this.commands.hasOwnProperty(split[0])) {
                this.commands[split[0]].fn(split);
                this.startReading();
            } else if (split[0] === "exit") {
                console.log('Bye!\n');
                process.exit(0);
            } else {
                console.error(`Root command ${split[0]} doesn't exist`);
                this.startReading();
            }
        });
    }
}