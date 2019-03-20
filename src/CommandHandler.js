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
        this.interface.question('Command: ', (command) => {
            let split = command.split(" ");
            if (this.commands.hasOwnProperty(command)) {
                this.commands[split[0]].execute(split.splice(0, 1));
                this.startReading();
            } else if (split[0] === "exit") {
                process.exit(0);
            } else {
                console.error(`Command ${split[0]} doesn't exist`);
                this.startReading();
            }
        });
    }
}