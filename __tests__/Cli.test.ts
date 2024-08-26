import { Cli } from "../src/Cli";

describe("Cli", () => {
    describe("create", () => {
        it("should add a directory", () => {
            const cli = new Cli();
            cli.create("foo");
            const forest = cli.getForest();
            expect(forest.trees["foo"]).toBeDefined();
        });

        it("should add 2 directories", () => {
            const cli = new Cli();
            cli.create("foo");
            cli.create("foo/bar");
            const forest = cli.getForest();
            expect(forest.trees["foo"].root.children["bar"]).toBeDefined();
        });

        it('should return "Invalid path: root folder name is missing"', () => {
            const cli = new Cli();
            const errorMessage = cli.create("");
            expect(errorMessage).toBe(
                "Invalid path: root folder name is missing"
            );
        });

        it('should return "Invalid path: baz does not exist"', () => {
            const cli = new Cli();
            cli.create("foo/bar");
            const errorMessage = cli.create("foo/baz/bar");
            expect(errorMessage).toBe("Invalid path: baz does not exist");
        });
    });
});
