import chalk from 'chalk';

export default {
  success(text) {
    console.log(chalk.green(`\n${text}\n`));
  },
  error(text) {
    console.log(chalk.bold.red(`\n${text}\n`));
  },
  warning(text) {
    console.log(chalk.keyword('orange')(`\n${text}\n`));
  },
};
