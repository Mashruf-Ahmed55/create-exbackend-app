import { spawn } from 'child_process';
import path from 'path';

export const setupESLint = async (projectDir) => {
  return new Promise((resolve, reject) => {
    const child = spawn('npm', ['init', '@eslint/config@latest'], {
      cwd: path.resolve(projectDir),
      stdio: 'inherit',
      shell: true,
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`ESLint config process exited with code ${code}`));
      }
    });
  });
};
