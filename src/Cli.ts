import { Forest } from "./Forest";
import { Tree } from "./Tree";
import { Node } from "./Node";
import { isPathValid } from "./utils";

export class Cli {
    protected forest: Forest;
    public multilineMode: boolean = false;
    public logQueue: string[] = [];

    constructor() {
        this.forest = new Forest();
    }

    public getForest(): Forest {
        return this.forest;
    }

    public setMultiLineMode(multilineMode: boolean) {
        this.multilineMode = multilineMode;
        if (!multilineMode) this.flushLogQueue();
    }

    create(directoryPath: string, { fromCli = false } = {}) {
        const { treeName, splitPath, error } = this.parsePath(directoryPath);
        if (error) return error;

        let tree = this.forest.trees[treeName];
        if (!tree) {
            const root = new Node(treeName);
            tree = new Tree(root);
            this.forest.addTree(tree);
        }

        let currentNode = tree.root;

        const pathIsValid = isPathValid(splitPath, currentNode);
        if (!pathIsValid.isValid) {
            return this.logAndReturnError(
                `Invalid path: ${pathIsValid.missingNode} does not exist`,
                { fromCli }
            );
        }

        for (let i = 1; i < splitPath.length; i++) {
            const directoryName = splitPath[i];
            if (!currentNode.children[directoryName]) {
                const newNode = new Node(directoryName);
                currentNode.addChild(newNode);
            }
            currentNode = currentNode.children[directoryName];
        }
        this.checkForMultilineMode(`CREATE ${directoryPath}`, { fromCli });
    }

    list() {
        let forestOutput = "";
        const treeNames = Object.keys(this.forest.trees);
        treeNames.sort((a, b) => a.localeCompare(b));
        treeNames.forEach((treeName) => {
            const tree = this.forest.trees[treeName];
            forestOutput += this.buildTreeOutput(tree);
        });
        this.checkForMultilineMode(`LIST\n${forestOutput}`.trimEnd(), {
            fromCli: true,
        });
        return `LIST\n${forestOutput}`.trimEnd();
    }

    move(
        originPath: string,
        destinationPath: string,
        { fromCli = false } = {}
    ) {
        const { splitPath: splitOriginPath, error: originError } =
            this.parsePath(originPath);
        if (originError) return originError;

        const { splitPath: splitDestinationPath, error: destinationError } =
            this.parsePath(destinationPath);
        if (destinationError) return destinationError;

        const directoryToBeMoved = splitOriginPath[splitOriginPath.length - 1];
        let currentOriginRootDirectory = this.getNodeByPath(splitOriginPath);

        let currentDestinationRootDirectory = this.getParentNode(
            splitDestinationPath,
            this.forest
        );

        if (!currentOriginRootDirectory || !currentDestinationRootDirectory) {
            return this.logAndReturnError(
                `Invalid path: ${originPath} or ${destinationPath} does not exist`,
                { fromCli }
            );
        }

        if (currentDestinationRootDirectory.children[directoryToBeMoved]) {
            return this.logAndReturnError(
                `Invalid destination path: ${directoryToBeMoved} already exists in ${destinationPath}`,
                { fromCli }
            );
        }

        if (currentOriginRootDirectory.name === directoryToBeMoved) {
            currentDestinationRootDirectory.addChild(
                currentOriginRootDirectory
            );
        } else {
            currentDestinationRootDirectory.addChild(
                currentOriginRootDirectory.children[directoryToBeMoved]
            );
        }

        this.delete(originPath);
        this.checkForMultilineMode(`MOVE ${originPath} ${destinationPath}`, {
            fromCli,
        });
    }

    delete(path: string, { fromCli = false } = {}) {
        const directoryToBeDeleted = path.split("/").pop()!;
        const { splitPath, error } = this.parsePath(path);

        if (error) return error;
        let parentDirectory = this.getNodeByPath(splitPath);
        if (!parentDirectory) {
            return this.logAndReturnError(
                `DELETE ${path}\nCannot delete ${path} - ${splitPath[0]} does not exist`.trimStart(),
                { fromCli }
            );
        }

        if (parentDirectory.children[directoryToBeDeleted]) {
            delete parentDirectory.children[directoryToBeDeleted];
            this.checkForMultilineMode(`DELETE ${path}`, { fromCli });
        } else if (this.forest.trees[directoryToBeDeleted]) {
            delete this.forest.trees[directoryToBeDeleted];
            this.checkForMultilineMode(`DELETE ${directoryToBeDeleted}`, {
                fromCli,
            });
        } else {
            return this.logAndReturnError(
                `${directoryToBeDeleted} not found in path`,
                {
                    fromCli,
                }
            );
        }
    }

    help() {
        console.log(`
            Available commands:
            create <path>        - Create a directory at the specified path.
            list                 - List all directories and subdirectories.
            move <src> <dest>    - Move a directory from src to dest.
            delete <path> <dir>  - Delete a directory at the specified path.
            help                 - Display this help message.
        `);
    }

    private parsePath(path: string) {
        const splitPath = path.split("/");
        const treeName = splitPath[0];
        if (!treeName) {
            const error = "Invalid path: root folder name is missing";
            this.checkForMultilineMode(error);
            return { treeName, splitPath, error };
        }
        return { treeName, splitPath };
    }

    private getNodeByPath(splitPath: string[]) {
        const treeName = splitPath[0];
        let currentNode = this.forest.trees[treeName]?.root;

        if (!currentNode) return undefined;

        for (let i = 1; i < splitPath.length - 1; i++) {
            if (!currentNode.children[splitPath[i]]) {
                return undefined;
            }
            currentNode = currentNode.children[splitPath[i]];
        }

        return currentNode;
    }

    private getParentNode(destinationPath: string[], forest: Forest) {
        if (destinationPath.length < 2)
            return forest.trees[destinationPath[0]]?.root;

        // Start at the root of the tree
        const treeName = destinationPath[0];
        let currentNode = forest.trees[treeName]?.root;

        // Traverse the path up to the parent node
        for (let i = 1; i < destinationPath.length; i++) {
            if (!currentNode) return undefined; // If at any point the node is undefined, the path is invalid
            currentNode = currentNode.children[destinationPath[i]];
        }
        return currentNode; // Return the parent node
    }

    private buildTreeOutput(tree: Tree) {
        const stack: { node: Node; depth: number }[] = [];
        let treeOutput = "";
        stack.push({ node: tree.root, depth: 0 });

        while (stack.length > 0) {
            const { node, depth } = stack.pop()!;
            treeOutput += `${" ".repeat(depth)}${node.name}\n`;
            let childNames = Object.keys(node.children);
            childNames = childNames.sort((a, b) => b.localeCompare(a));
            for (const childName of childNames) {
                stack.push({
                    node: node.children[childName],
                    depth: depth + 2,
                });
            }
        }
        return treeOutput;
    }

    private logAndReturnError(message: string, { fromCli = false } = {}) {
        this.checkForMultilineMode(message, { fromCli });
        return message;
    }

    private checkForMultilineMode(message: string, { fromCli = false } = {}) {
        if (this.multilineMode && fromCli) {
            this.logQueue.push(message);
        } else if (this.multilineMode && !fromCli) {
            console.log(message);
        } else if (!this.multilineMode && fromCli) {
            console.log(message);
        }
    }

    private flushLogQueue() {
        this.logQueue.forEach((message) => console.log(message));
        this.logQueue = [];
    }
}
