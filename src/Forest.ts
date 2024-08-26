import { Tree } from "./Tree";

export class Forest {
    trees: { [key: string]: Tree };

    constructor() {
        this.trees = {};
    }

    addTree(tree: Tree) {
        this.trees[tree.root.name] = tree;
    }

    removeTree(tree: Tree) {}
}
