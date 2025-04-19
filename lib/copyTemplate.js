import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

export async function copyTemplate({ language, db, projectName }) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const basePath = path.join(__dirname, '..', 'templates');

  let templateName = '';
  if (db === 'Mongoose') {
    templateName = language === 'Express + TS' ? 'mongoosets' : 'mongoosejs';
  } else {
    templateName = language === 'Express + TS' ? 'prismats' : 'prismajs';
  }

  const sourceDir = path.join(basePath, templateName);
  const targetDir =
    projectName === '.' ? process.cwd() : path.resolve(projectName);

  await fs.copy(sourceDir, targetDir);

  const pkgPath = path.join(targetDir, 'package.json');
  const pkg = await fs.readJSON(pkgPath);
  pkg.name = path.basename(targetDir);
  await fs.writeJSON(pkgPath, pkg, { spaces: 2 });

  return targetDir;
}
