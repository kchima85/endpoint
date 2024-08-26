export class Node {
    name: string;
    children: { [key: string]: Node };

    constructor(name: string) {
        this.name = name;
        this.children = {};
    }

    addChild(node: Node) {
        if (!this.children[node.name]) {
            this.children[node.name] = node;
        }
    }
}
