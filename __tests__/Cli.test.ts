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

    describe("list", () => {
        it("should list all directories with correct indentation", () => {
            const cli = new Cli();
            cli.create("foo");
            cli.create("foo/bar");
            cli.create("foo/bar/baz");
            cli.create("foo/baz");
            cli.create("baz");
            const output = cli.list();
            const structure = `LIST\nbaz\nfoo\n  bar\n    baz\n  baz`;
            expect(output).toBe(structure);
        });
    });

    describe("move", () => {
        it("should move a leaf directory within the same tree", () => {
            const cli = new Cli();
            cli.create("foo");
            cli.create("foo/bar");
            cli.create("foo/bar/baz");
            cli.create("foo/baz");
            cli.move("foo/bar/baz", "foo/baz");

            const forest = cli.getForest();
            expect(
                forest.trees["foo"].root.children["baz"].children["baz"]
            ).toBeDefined();
        });

        it("should move a directory with children within the same tree", () => {
            const cli = new Cli();
            cli.create("foo");
            cli.create("foo/bar");
            cli.create("foo/bar/baz");
            cli.create("foo/baz");
            cli.move("foo/bar", "foo/baz"); // bar/baz should be moved to foo/baz/bar/baz

            const forest = cli.getForest();
            expect(
                forest.trees["foo"].root.children["baz"].children["bar"]
                    .children["baz"]
            ).toBeDefined();
        });

        it("should move a leaf directory to a different tree", () => {
            const cli = new Cli();
            cli.create("foo");
            cli.create("foo/bar");
            cli.create("foo/bar/baz");
            cli.create("baz");
            cli.move("foo/bar/baz", "baz");

            const forest = cli.getForest();
            expect(forest.trees["baz"].root.children["baz"]).toBeDefined();
        });

        it("should move a directory with children to a different tree", () => {
            const cli = new Cli();
            cli.create("foo");
            cli.create("foo/bar");
            cli.create("foo/bar/baz");
            cli.create("baz");
            cli.move("foo/bar", "baz");

            const forest = cli.getForest();
            expect(
                forest.trees["baz"].root.children["bar"].children["baz"]
            ).toBeDefined();
        });

        it("should not move a directory if the directory already exists", () => {
            const cli = new Cli();
            cli.create("foo");
            cli.create("foo/bar");
            cli.create("foo/bar/baz");
            cli.create("foo/baz");

            const expectedError = cli.move("foo/bar/baz", "foo");
            expect(expectedError).toBe(
                "Invalid destination path: baz already exists in foo"
            );
        });

        it("should not move a directory if the destination path is invalid", () => {
            const cli = new Cli();
            cli.create("foo");
            cli.create("foo/bar");
            cli.create("foo/bar/baz");
            cli.create("foo/baz");

            const expectedError = cli.move("foo/bar/baz", "invalid/path");
            expect(expectedError).toBe(
                "Invalid path: foo/bar/baz or invalid/path does not exist"
            );
        });
    });
});
