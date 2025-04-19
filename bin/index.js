#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import { copyTemplate } from '../lib/copyTemplate.js';
import { installDependencies } from '../lib/installDeps.js';
import { promptUser } from '../lib/questions.js';

console.clear();

// Main CLI runner
async function run() {
  console.log(chalk.cyan('\n🚀 Welcome to create-exbackend-app!\n'));

  const answers = await promptUser();
  try {
    const projectPath = await copyTemplate({
      language: answers.language,
      db: answers.db,
      projectName: answers.projectName,
    });

    const installSpinner = ora({
      text: 'Cooking your backend project...',
      spinner: {
        interval: 80,
        frames: ['🍳 ', '🥚 ', '🔥 ', '🥘 ', '✅ '],
      },
    }).start();
    await installDependencies(projectPath);
    installSpinner.succeed('Done! Your backend project is cooked! 🍽️');
    console.log(`\n👉 To get started:`);
    if (answers.projectName !== '.' && answers.projectName !== './') {
      console.log(chalk.cyan(`   cd ${answers.projectName}`));
    }
    console.log(chalk.cyan(`   npm run dev --for development`));
    console.log(chalk.cyan(`   npm run start --for production`));
    console.log('\n🛠️  Happy coding!\n');
  } catch (error) {
    spinner.fail('Something went wrong.');
    console.error(chalk.red('Error:'), error.message);
  }
}

run();
