#!/usr/bin/env node
import * as Readline from "readline";
import { Cli } from "./Cli";

const rl = Readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "",
});

console.log("Welcome to the CLI!");
console.log("Type 'help' to see the available commands.");
console.log("Type 'exit' to exit the CLI.");
console.log("Type 'create <directory>' to create a new directory.");
console.log("Type 'list' to list all directories.");
console.log("Type 'move <origin> <destination>' to move a directory.");
console.log("Type 'delete <directory>' to delete a directory.");
console.log("``` to enter multiline mode. Type ``` to exit multiline mode.");

function validateArgCount(passedArgs: number, intendedArgCount: number) {
    if (passedArgs !== intendedArgCount) {
        console.log("Invalid number of arguments");
        return false;
    }
    return true;
}

function main() {
    rl.prompt();
    const cli = new Cli();
    rl.on("line", (line) => {
        let argCount: number;
        const [command, ...args] = line.trim().split(" ");
        switch (command.toLocaleLowerCase()) {
            case "create":
                argCount = args.length;
                if (!validateArgCount(argCount, 1)) {
                    console.log("Invalid number of arguments");
                    break;
                }
                const newDirectory = args[0];
                cli.create(newDirectory, { fromCli: true });
                break;
            case "list":
                cli.list();
                break;
            case "move":
                argCount = args.length;
                if (!validateArgCount(argCount, 2)) {
                    console.log("Invalid number of arguments");
                    break;
                }
                const originPath = args[0];
                const destinationPath = args[1];
                cli.move(originPath, destinationPath, { fromCli: true });
                break;
            case "delete":
                argCount = args.length;
                if (!validateArgCount(argCount, 1)) {
                    console.log("Invalid number of arguments");
                    break;
                }
                const directoryToDelete = args[0];
                cli.delete(directoryToDelete, { fromCli: true });
                break;
            case "help":
                cli.help();
                break;
            case "exit":
                rl.close();
                break;
            case "```":
                cli.setMultiLineMode(!cli.multilineMode);
                break;
            case "":
                break;
            default:
                if (!cli.multilineMode) console.log("Invalid command");
        }
        rl.prompt();
    })
        .on("close", () => {
            console.log("Exiting...");
            process.exit(0);
        })
        .on("error", (err) => {
            console.log("print error");
            console.error(err);
        });
}

main();
