/// <reference types="jasmine" />

import { parse } from "../preprocessor";

import fs = require('fs');

function removeCR(f: string): string {
   return f.split('\n').map(line=>line.split('\r').join('')).join('\n');
}

function read(fileName: string) {
   return fs.readFileSync(fileName).toString();
}

function write(fileName: string, data: string) {
   return fs.writeFileSync(fileName, data);
}

const defs = {
   DEBUG: true,
   production: false,
   version: 3.5,
   OS: "android"
};

describe("files spec", ()=> {

   it('works with coffee', () => {
      const inFile = read('spec/data/coffee.in.coffee');
      const coffee = true;
      const actualFile = parse(inFile, defs, false, false, coffee);
      const expectedFile = read('spec/data/coffee.out.coffee');
      write('spec/data/coffee.actual.coffee', actualFile);
      expect(actualFile).toEqual(expectedFile);
   });

   const files = [ "simple", "nested", "dfleury", "nested.else", "simple.doubleslash" ];

   const fileSet = files.map(fn => ({
      input:    `spec/data/${fn}.in.js`,
      output:   `spec/data/${fn}.out.js`,
      actual:   `spec/data/${fn}.out.actual.js`,
      actualLF: `spec/data/${fn}.out.actual.lf.js`
   }));

   // checks spec files as terminating in CRLF (windows)
   fileSet.forEach( ({ input, output, actual })=> {
      it(`works on ${input}`, ()=> {
         const tripleSlash = input.indexOf(".doubleslash.")==-1;
         const inFile = read(input);
         const actualFile = parse(inFile, defs, false, tripleSlash);
         const expectedFile = read(output);
         write(actual, actualFile);
         expect(actualFile).toEqual(expectedFile);
      });
   });

   // checks spec files as terminating in LF only (unix)
   fileSet.forEach( ({ input, output, actualLF })=> {
      it(`works on ${input}`, ()=> {
         const tripleSlash = input.indexOf(".doubleslash.")==-1;
         const inFile = removeCR(read(input));
         const actualFile = parse(inFile, defs, false, tripleSlash);
         const expectedFile = removeCR(read(output));
         write(actualLF, actualFile);
         expect(actualFile).toEqual(expectedFile);
      });
   });

});

describe("webpack bundle", ()=>{
   const files = [ "webpack" ];

   const fileSet = files.map(fn => ({
      input:    `spec/data/${fn}.in.js`,
      output:   `spec/data/${fn}.out.js`,
      actual:   `spec/data/${fn}.out.actual.js`
   }));

   // checks spec files as terminating in CRLF (windows)
   fileSet.forEach( ({ input, output, actual })=> {
      it(`build correctly on ${input}`, ()=> {
         const inFile = read(input);
         const actualFile = read(actual);
         const expectedFile = read(output);
         expect(actualFile).toEqual(expectedFile);
      });
   });

});
