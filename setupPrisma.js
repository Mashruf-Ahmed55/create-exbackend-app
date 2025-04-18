import { spawn } from 'child_process';
import path from 'path';

export const setupPrisma = async (projectDir) => {
  return new Promise((resolve, reject) => {
    const child = spawn('npx', ['prisma', 'init'], {
      cwd: path.resolve(projectDir),
      stdio: 'inherit',
      shell: true,
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Prisma init process exited with code ${code}`));
      }
    });
  });
};
