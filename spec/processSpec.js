"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var preprocessor_1 = require("../preprocessor");
var fs = require("fs");
function removeCR(f) {
    return f.split('\n').map(function (line) { return line.split('\r').join(''); }).join('\n');
}
function read(fileName) {
    return fs.readFileSync(fileName).toString();
}
function write(fileName, data) {
    return fs.writeFileSync(fileName, data);
}
var defs = {
    DEBUG: true,
    production: false,
    version: 3.5,
    OS: "android"
};
describe("files spec", function () {
    it('works with coffee', function () {
        var inFile = read('spec/data/coffee.in.coffee');
        var coffee = true;
        var actualFile = preprocessor_1.parse(inFile, defs, false, false, coffee);
        var expectedFile = read('spec/data/coffee.out.coffee');
        write('spec/data/coffee.actual.coffee', actualFile);
        expect(actualFile).toEqual(expectedFile);
    });
    var files = ["simple", "nested", "dfleury", "nested.else", "simple.doubleslash"];
    var fileSet = files.map(function (fn) { return ({
        input: "spec/data/" + fn + ".in.js",
        output: "spec/data/" + fn + ".out.js",
        actual: "spec/data/" + fn + ".out.actual.js",
        actualLF: "spec/data/" + fn + ".out.actual.lf.js"
    }); });
    fileSet.forEach(function (_a) {
        var input = _a.input, output = _a.output, actual = _a.actual;
        it("works on " + input, function () {
            var tripleSlash = input.indexOf(".doubleslash.") == -1;
            var inFile = read(input);
            var actualFile = preprocessor_1.parse(inFile, defs, false, tripleSlash);
            var expectedFile = read(output);
            write(actual, actualFile);
            expect(actualFile).toEqual(expectedFile);
        });
    });
    fileSet.forEach(function (_a) {
        var input = _a.input, output = _a.output, actualLF = _a.actualLF;
        it("works on " + input, function () {
            var tripleSlash = input.indexOf(".doubleslash.") == -1;
            var inFile = removeCR(read(input));
            var actualFile = preprocessor_1.parse(inFile, defs, false, tripleSlash);
            var expectedFile = removeCR(read(output));
            write(actualLF, actualFile);
            expect(actualFile).toEqual(expectedFile);
        });
    });
});
