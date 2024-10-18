import replace from './replace.js';
import generate from './generate.js';
import minimist from 'minimist';

const args = minimist(process.argv.slice(2));

if (args.generate) {
  generate();
} else {
  replace();
}
