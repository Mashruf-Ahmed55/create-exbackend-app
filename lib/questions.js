import chalk from 'chalk';
import inquirer from 'inquirer';
export async function promptUser() {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'Enter your project name:',
      default: 'my-app',
      validate: (input) => {
        if (!input) return 'Project name cannot be empty';
        return true;
      },
      filter: (input) => input.trim(),
    },
    {
      type: 'list',
      name: 'language',
      message: chalk.cyan('🎯 Which language do you want to use?'),
      choices: ['Express + JS', 'Express + TS'],
    },
    {
      type: 'list',
      name: 'db',
      message: chalk.cyan('🎯 Which ORM/ODM setup do you want?'),
      choices: ['Mongoose', 'Prisma'],
    },
  ]);

  return answers;
}
