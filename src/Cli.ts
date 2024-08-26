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
}
