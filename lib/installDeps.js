import { exec } from 'child_process';
import path from 'path';

export function installDependencies(projectPath) {
  return new Promise((resolve, reject) => {
    exec(
      'npm install',
      { cwd: path.resolve(projectPath) },
      (error, stdout, stderr) => {
        if (error) {
          console.error(`❌ Install failed: ${stderr}`);
          reject(error);
        } else {
          console.log(stdout);
          resolve();
        }
      }
    );
  });
}
