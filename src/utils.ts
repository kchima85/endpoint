import { Node } from "./Node";

export const isPathValid = (splitPath: string[], currentNode: Node) => {
    if (!currentNode) return { isValid: false, missingNode: splitPath[0] };
    if (splitPath.length === 1) return { isValid: true, missingNode: null };

    for (let i = 0; i < splitPath.length - 1; i++) {
        const nodeName = splitPath[i];
        // if the current node is not the same as the node in the path, the path is invalid
        if (!currentNode || currentNode.name !== nodeName) {
            return { isValid: false, missingNode: splitPath[i] };
        }
        let nextNode = currentNode.children[splitPath[i + 1]];
        currentNode = nextNode;
    }
    return { isValid: true, missingNode: null };
};
