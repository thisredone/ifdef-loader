interface IStart {
   line: number;
   keyword: string;
   condition: string;
}

export function parse(source, defs, verbose?: boolean): string {
   const lines = source.split('\n');

   for(let n=0;;) {
      let startInfo = find_start_if(lines,n);
      if(startInfo === undefined) break;

      const endLine = find_end(lines, startInfo.line);
      if(endLine === -1) {
         throw `#if without #endif in line ${startInfo.line+1}`;
      }

      const cond = evaluate(startInfo.condition, startInfo.keyword, defs);

      if(cond) {
         if(verbose) {
            console.log(`matched condition #${startInfo.keyword} ${startInfo.condition} => including lines [${startInfo.line+1}-${endLine+1}]`);
         }
         blank_code(lines, startInfo.line, startInfo.line);
         blank_code(lines, endLine, endLine);
      }
      else {
         blank_code(lines, startInfo.line, endLine);
         if(verbose) {
            console.log(`not matched condition #${startInfo.keyword} ${startInfo.condition} => excluding lines [${startInfo.line+1}-${endLine+1}]`);
         }
      }

      n = startInfo.line;
   }

   return lines.join('\n');
}

function match_if(line: string): IStart|undefined {
   const re = /^\/\/([\s]*)#(if)([\s\S]+)$/g;
   const match = re.exec(line);
   if(match) {
      return {
         line: -1,
         keyword: match[2],
         condition: match[3].trim()
      };
   }
   return undefined;
}

function match_endif(line: string): boolean {
   const re = /^\/\/([\s]*)#(endif)[\s]*$/g;
   const match = re.exec(line);
   if(match) return true;
   return false
}

function find_start_if(lines: string[], n: number): IStart|undefined {
   for(let t=n; t<lines.length; t++) {
      const match = match_if(lines[t]);
      if(match !== undefined) {
         match.line = t;
         return match;
         // TODO: when es7 write as: return { line: t, ...match };
      }
   }
   return undefined;
}

function find_end(lines: string[], start: number): number {
   let level = 1;
   for(let t=start+1; t<lines.length; t++) {
      const mif  = match_if(lines[t]);
      const mend = match_endif(lines[t]);

      if(mif) {
         level++;
      }

      if(mend) {
         level--;
         if(level === 0) {
            return t;
         }
      }
   }
   return -1;
}

/**
 * @return true if block has to be preserved
 */
function evaluate(condition: string, keyword: string, defs: any): boolean {

   let code = "(function(){";
   for(let key in defs) {
      code += `var ${key} = ${JSON.stringify(defs[key])};`;
   }
   code += `return (${condition}) ? true : false;})()`;

   let result: boolean;
   try {
      result = eval(code);
      //console.log(`evaluation of (${condition}) === ${result}`);
   }
   catch(error) {
      throw `error evaluation #if condition(${condition}"): ${error}`;
   }

   if(keyword === "ifndef") {
      result = !result;
   }

   return result;
}

function blank_code(lines: string[], start: number, end: number) {
   for(let t=start; t<=end; t++) {
      const lastChar = lines[t].charAt(lines[t].length-1);
      if(lastChar === '\r') {
         lines[t] = ("/" as any).repeat(lines[t].length+1)+'\r';
      }
      else {
         lines[t] = ("/" as any).repeat(lines[t].length);
      }
   }
}
