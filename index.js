#!/usr/bin/env node

import chalk from 'chalk';
import { exec } from 'child_process';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import ora from 'ora';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';
import { setupESLint } from './setupESLint.js';
import { setupPrisma } from './setupPrisma.js';

const execAsync = promisify(exec);
const log = console.log;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const spinner = ora();

(async () => {
  const rainbowColors = [[34, 193, 195]];
  const rainbowText = (text) => {
    return text
      .split('')
      .map((char, i) => {
        const [r, g, b] = rainbowColors[i % rainbowColors.length];
        return chalk.rgb(r, g, b)(char);
      })
      .join('');
  };
  log(chalk.bold('\n' + rainbowText('✨ Welcome to Express App! ✨') + '\n'));

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
│   ├── services/
│   └── ${useTS ? 'app.ts' : 'app.js'}
├── .env
├── .gitignore
├── .prettierrc
├── .eslintrc.json
├── ${useTS ? 'index.ts' : 'index.js'}
└── README.md
\`\`\`

---

Created with ❤️ by create-exbackend-app CLI
`;
  const envCode = `PORT=5000\nNODE_ENV=development\n`;
  const gitignoreCode = `# Logs\n
logs\n
*.log\n
npm-debug.log*\n
yarn-debug.log*\n
yarn-error.log*\n
lerna-debug.log*\n
.pnpm-debug.log*\n
\n
# Diagnostic reports (https://nodejs.org/api/report.html)\n
report.[0-9]*.[0-9]*.[0-9]*.[0-9]*.json\n
\n
# Runtime data\n
pids\n
*.pid\n
*.seed\n
*.pid.lock\n
\n
# Directory for instrumented libs generated by jscoverage/JSCover\n
lib-cov\n
\n
# Coverage directory used by tools like istanbul\n
coverage\n
*.lcov\n
\n
# nyc test coverage\n
.nyc_output\n
\n
# Grunt intermediate storage (https://gruntjs.com/creating-plugins#storing-task-files)\n
.grunt\n
\n
# Bower dependency directory (https://bower.io/)\n
bower_components\n
\n
# node-waf configuration\n
.lock-wscript\n
\n
# Compiled binary addons (https://nodejs.org/api/addons.html)\n
build/Release\n
\n
# Dependency directories\n
node_modules/\n
jspm_packages/\n
\n
# Snowpack dependency directory (https://snowpack.dev/)\n
web_modules/\n
\n
# TypeScript cache\n
*.tsbuildinfo\n
\n
# Optional npm cache directory\n
.npm\n
\n
# Optional eslint cache\n
.eslintcache\n
\n
# Optional stylelint cache\n
.stylelintcache\n
\n
# Microbundle cache\n
.rpt2_cache/\n
.rts2_cache_cjs/\n
.rts2_cache_es/\n
.rts2_cache_umd/\n
\n
# Optional REPL history\n
.node_repl_history\n
\n
# Output of 'npm pack'\n
*.tgz\n
\n
# Yarn Integrity file\n
.yarn-integrity\n
\n
# dotenv environment variable files\n
.env\n
.env.development.local\n
.env.test.local\n
.env.production.local\n
.env.local\n
\n
# parcel-bundler cache (https://parceljs.org/)\n
.cache\n
.parcel-cache\n
\n
# Next.js build output\n
.next\n
out\n
\n
# Nuxt.js build / generate output\n
.nuxt\n
dist\n
\n
# Gatsby files\n
.cache/\n
# Comment in the public line in if your project uses Gatsby and not Next.js\n
# https://nextjs.org/blog/next-9-1#public-directory-support\n
# public\n
\n
# vuepress build output\n
.vuepress/dist\n
\n
# vuepress v2.x temp and cache directory\n
.temp\n
.cache\n
\n
# vitepress build output\n
**/.vitepress/dist\n
\n
# vitepress cache directory\n
**/.vitepress/cache\n
\n
# Docusaurus cache and generated files\n
.docusaurus\n
\n
# Serverless directories\n
.serverless/\n
\n
# FuseBox cache\n
.fusebox/\n
\n
# DynamoDB Local files\n
.dynamodb/\n
\n
# TernJS port file\n
.tern-port\n
\n
# Stores VSCode versions used for testing VSCode extensions\n
.vscode-test\n
\n
# yarn v2\n
.yarn/cache\n
.yarn/unplugged\n
.yarn/build-state.yml\n
.yarn/install-state.gz\n
.pnp.*\n
`;

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
      compression: '^1.8.0',
      'cookie-parser': '^1.4.7',
      cors: '^2.8.5',
      dotenv: '^16.5.0',
      express: '^5.1.0',
      'express-mongo-sanitize': '^2.2.0',
      'express-rate-limit': '^7.5.0',
      helmet: '^8.1.0',
      hpp: '^0.2.3',
      morgan: '^1.10.0',
      ...(usePrisma
        ? {
            '@prisma/client': '^6.6.0',
          }
        : { mongoose: '^8.13.2' }),
    },
    devDependencies: {
      ...(useTS && {
        typescript: '^5.8.3',
        '@types/node': '^22.14.1',
        '@types/express': '^5.0.1',
        '@types/morgan': '^1.9.9',
        '@types/cors': '^2.8.17',
        '@types/cookie-parser': '^1.4.8',
        '@types/compression': '^1.7.5',
        '@types/hpp': '^0.2.6',
      }),
      ...(usePrettier && {
        prettier: '^3.5.3',
      }),
      ...(useTS ? { tsx: '^4.19.3' } : { nodemon: '^3.1.0' }),
      ...(usePrisma && {
        prisma: '^6.6.0',
      }),
    },
  };

  await fs.outputJSON(path.join(projectPath, 'package.json'), packageJson, {
    spaces: 2,
  });
  spinner.succeed('Project structure created.');
  if (useESLint) {
    console.log('\n🛠 Setting up ESLint...');
    try {
      await setupESLint(projectName);
      console.log('✅ ESLint setup completed!');
    } catch (err) {
      console.error('❌ ESLint setup failed:', err);
    }
  }
  if (usePrisma) {
    console.log('\n🛠 Setting up Prisma...');
    try {
      await setupPrisma(projectName);
      console.log('✅ Prisma setup completed!');
    } catch (err) {
      console.error('❌ Prisma setup failed:', err);
    }
  }
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
      chalk.italic(
        '\n' + rainbowText(`\n🎉 Project ${projectName} is ready!\n`) + '\n'
      )
    );
    log(chalk.yellow(`📂 Location: ${projectPath}`));
    log(chalk.cyan(`📜 To start:`));
    projectName !== '.' && log(chalk.cyan(`   cd ${projectName}`));
    log(
      chalk.redBright.italic(
        `   npx npm-check-updates -u     # Check for updates(optional)`
      )
    );
    log(chalk.cyan(`   npm run dev`));
  } catch (err) {
    spinner.fail('Dependency installation failed.');
    console.error(err);
  }
})();
