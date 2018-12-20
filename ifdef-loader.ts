import * as loaderUtils from 'loader-utils';
import { parse } from './preprocessor';

export = function(source: string, map) {
   this.cacheable && this.cacheable();

   const options = loaderUtils.getOptions(this);
   const originalData = options.json || options;

   const data = { ...originalData };

   const verboseFlag = "ifdef-verbose";
   const verbose = data[verboseFlag];
   if(verbose !== undefined) {
      delete data[verboseFlag];
   }

   const tripleSlashFlag = "ifdef-triple-slash";
   const tripleSlash = data[tripleSlashFlag];
   if(tripleSlash !== undefined) {
      delete data[tripleSlashFlag];
   }

   const coffeeFlag = "ifdef-coffee";
   const coffee = data[coffeeFlag];
   if(coffee !== undefined) {
      delete data[coffeeFlag];
   }

   try {
      source = parse(source, data, verbose, tripleSlash, coffee);
      this.callback(null, source, map);
   } catch(err) {
      const errorMessage = `ifdef-loader error: ${err}`;
      this.callback(new Error(errorMessage));
   }
};
