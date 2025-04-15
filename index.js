#!/usr/bin/env node

import chalk from 'chalk';
import { exec } from 'child_process';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import ora from 'ora';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

const execAsync = promisify(exec);
const log = console.log;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const spinner = ora();

(async () => {
  log(chalk.greenBright.bold('\n✨ Welcome to create-exbackend-app CLI! ✨\n'));

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'Project name?',
      default: 'my-app',
    },
    {
      type: 'confirm',
      name: 'useTS',
      message: 'Use TypeScript?',
      default: true,
    },
    {
      type: 'confirm',
      name: 'useESLint',
      message: 'Use ESLint?',
      default: true,
    },
    {
      type: 'confirm',
      name: 'useModuleJS',
      message: 'Use ModuleJS (ESM)?',
      default: true,
    },
    {
      type: 'confirm',
      name: 'usePrettier',
      message: 'Setup Prettier?',
      default: true,
    },
    {
      type: 'list',
      name: 'orm',
      message: 'Choose ORM/ODM:',
      choices: ['Prisma', 'Mongoose'],
      default: 'Mongoose',
    },
  ]);

  const getProjectInfo = (name) => {
    const isCurrentDir = name === '.' || name === './';
    const finalPath = isCurrentDir
      ? process.cwd()
      : path.join(process.cwd(), name);
    const finalName = isCurrentDir ? path.basename(finalPath) : name;
    return { finalName, finalPath };
  };

  const { finalName: projectName, finalPath: projectPath } = getProjectInfo(
    answers.projectName
  );
  const { useTS, useESLint, useModuleJS, usePrettier, orm } = answers;
  const usePrisma = orm === 'Prisma';

  const entryFile = useTS ? 'index.ts' : 'index.js';
  const srcEntryFile = useTS ? 'app.ts' : 'app.js';
  const configEntryFile = useTS ? 'envConfig.ts' : 'envConfig.js';

  const folders = [
    'src',
    'src/routes',
    'src/controllers',
    'src/models',
    'src/config',
    'src/middleware',
    'src/services',
  ];
  spinner.start('Creating project folder and files...');
  await fs.ensureDir(projectPath);

  const srcPath = path.join(projectPath, 'src');
  const configPath = path.join(srcPath, 'config');
  for (const folder of folders) {
    await fs.ensureDir(path.join(projectPath, folder));
  }

  const entryCode = `
import http from 'http';
import app from './src/${srcEntryFile.replace(/\.ts$/, '.js')}';
import envConfig from './src/config/${configEntryFile.replace(/\.ts$/, '.js')}';

const server = http.createServer(app);

const startServer = async () => {
  server.listen(envConfig.port, () => {
    console.log(\`Server is running on http://localhost:\${envConfig.port}\`);
  });
};

startServer();
`;

  const srcEntryCode = `
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import ExpressMongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import envConfig from './config/envConfig.js';
const app = express();

if (envConfig.nodeEnv !== 'development') {
  app.use(helmet());
  app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
  app.use(morgan('combined'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(hpp());
  app.use(compression());
  app.use(ExpressMongoSanitize());
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
    })
  );
} else {
  app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
  app.use(morgan('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
}

app.get('/', (req, res) => {
  res.send('Server is running 🚀');
});

export default app;
`;

  const configCode = `
import 'dotenv/config';

const _config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
};

const envConfig = Object.freeze(_config);
export default envConfig;
`;

  const readmeCode = `# ${projectName}

A minimal backend starter project created with \`create-exbackend-app\`.

## 📦 Stack
- Express.js
- ${useTS ? 'TypeScript' : 'JavaScript'}
- ${orm}
- dotenv, morgan, cors, cookie-parser${useESLint ? ', ESLint' : ''}${
    usePrettier ? ', Prettier' : ''
  }

## 🚀 Quick Start

\`\`\`bash
cd ${projectName}
npm install
${useTS ? 'npm run build && node dist/index.js' : 'node index.js'}
\`\`\`

## 🧱 Folder Structure

\`\`\`
${projectName}/
├── src/
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── config/
│   ├── middleware/
│   └── services/
├── .env
├── .gitignore
├── ${useTS ? 'index.ts' : 'index.js'}
└── README.md
\`\`\`

---

Created with ❤️ by create-exbackend-app CLI
`;
  const envCode = `PORT=5000\nNODE_ENV=development\n`;
  const gitignoreCode = `node_modules/\ndist/\n.env\n*.log\n*.tsbuildinfo\n.cache/\n.vscode/\n`;

  await fs.outputFile(path.join(projectPath, entryFile), entryCode.trimStart());
  await fs.outputFile(
    path.join(srcPath, srcEntryFile),
    srcEntryCode.trimStart()
  );
  await fs.outputFile(
    path.join(configPath, configEntryFile),
    configCode.trimStart()
  );
  await fs.outputFile(path.join(projectPath, '.env'), envCode);
  await fs.outputFile(path.join(projectPath, '.gitignore'), gitignoreCode);
  await fs.outputFile(path.join(projectPath, 'README.md'), readmeCode);

  if (useTS) {
    const tsConfig = {
      compilerOptions: {
        target: 'ESNext',
        module: useModuleJS ? 'ESNext' : 'CommonJS',
        moduleResolution: 'node',
        esModuleInterop: true,
        forceConsistentCasingInFileNames: true,
        strict: true,
        skipLibCheck: true,
        rootDir: './',
        outDir: 'dist',
      },
      include: ['src', 'index.ts'],
    };
    await fs.outputJSON(path.join(projectPath, 'tsconfig.json'), tsConfig, {
      spaces: 2,
    });
  }

  if (usePrettier) {
    const prettierConfig = {
      semi: true,
      singleQuote: true,
      printWidth: 80,
      tabWidth: 2,
      trailingComma: 'es5',
    };
    await fs.outputJSON(path.join(projectPath, '.prettierrc'), prettierConfig, {
      spaces: 2,
    });
  }

  if (useESLint && useTS) {
    const eslintConfig = {
      parser: '@typescript-eslint/parser',
      extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      rules: {},
    };
    await fs.outputJSON(
      path.join(projectPath, '.eslintrc.json'),
      eslintConfig,
      { spaces: 2 }
    );
  }

  const packageJson = {
    name: projectName,
    version: '1.0.0',
    main: entryFile,
    type: useModuleJS ? 'module' : 'commonjs',
    scripts: {
      dev: useTS ? 'tsx watch index.ts' : 'nodemon index.js',
      build: useTS ? 'tsc' : 'echo "No build step needed for JS"',
      start: useTS ? 'node dist/index.js' : 'node index.js',
    },
    dependencies: {
    compression: "^1.8.0",
    "cookie-parser": "^1.4.7",
    cors: "^2.8.5",
    dotenv: "^16.5.0",
    express: "^5.1.0",
    "express-mongo-sanitize": "^2.2.0",
    "express-rate-limit": "^7.5.0",
    helmet: "^8.1.0",
    hpp: "^0.2.3",
    morgan: "^1.10.0",
      ...(usePrisma ? {
      "@prisma/client": "^6.6.0",
      } : { mongoose: "^8.13.2" }),
    },
    devDependencies: {
      ...(useTS && {
        typescript: "^5.8.3",
        "@types/node": "^22.14.1",
        '@types/express': '^5.0.1',
        '@types/morgan': '^1.9.9',
        '@types/cors': '^2.8.17',
        '@types/cookie-parser': '^1.4.8',
        "@types/compression": "^1.7.5",
        "@types/hpp": "^0.2.6",
      }),
      ...(useESLint &&
        useTS && {
          eslint: '^9.24.0',
          '@typescript-eslint/eslint-plugin': '^8.30.1',
          '@typescript-eslint/parser': '^8.30.1',
        }),
      ...(usePrettier && {
        prettier: '^3.5.3',
      }),
      ...(useTS ? {  tsx: "^4.19.3" } : { nodemon: '^3.1.0' }),
      ...(usePrisma && {
        prisma: '^6.6.0',
      }),
    },
  };

  await fs.outputJSON(path.join(projectPath, 'package.json'), packageJson, {
    spaces: 2,
  });

  spinner.succeed('Project structure created.');

  spinner.text = 'Installing dependencies...';
  spinner.start();

  try {
    await execAsync(`npm init -y`, { cwd: projectPath });
    const baseDeps = Object.keys(packageJson.dependencies).map(
      (dep) => `${dep}@${packageJson.dependencies[dep]}`
    );
    const devDeps = Object.keys(packageJson.devDependencies).map(
      (dep) => `${dep}@${packageJson.devDependencies[dep]}`
    );

    await execAsync(`npm install ${baseDeps.join(' ')}`, { cwd: projectPath });
    if (devDeps.length > 0) {
      await execAsync(`npm install -D ${devDeps.join(' ')}`, {
        cwd: projectPath,
      });
    }
    spinner.succeed(
      chalk.greenBright(`\n🎉 Project ${projectName} is ready!\n`)
    );
    log(chalk.yellow(`📂 Location: ${projectPath}`));
    log(chalk.cyan(`📜 To start:`));
    projectName !== '.' && log(chalk.cyan(`   cd ${projectName}`));
    log(chalk.redBright(`   npx npm-check-updates -u`))
    log(chalk.cyan(`   npm install`));
    log(chalk.cyan(`   npm run dev`));
  } catch (err) {
    spinner.fail('Dependency installation failed.');
    console.error(err);
  }
})();
