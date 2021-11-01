import path from 'path';
import { execSync } from 'child_process';
import AdmZip from 'adm-zip';

const ZIP_EXT_NAME = 'ggc.zip';

(function main() {
  const rootPath = getRootPath();
  const dirname = rootPath.split(path.sep).pop(); // path.basename(process.cwd());
  const name = `${dirname}_${dateFormat(new Date())}`;

  const files = getChangedFiles();
  writeZipFile(files, rootPath, name);
})();

function getRootPath() {
  let gitPath = execSync('git rev-parse --show-cdup', { encoding: 'utf8' }).trim();
  return path.join(process.cwd(), gitPath).replace(/\/$/, '');
}

function dateFormat(date: Date | number | null, format = 'YYYYMMDD-hhmmss') {
  if (!date) {
    return '';
  }
  if (typeof date == 'number') {
    date = new Date(date * 1000);
  }
  let values: Record<string, string> = {
    Y: date.getFullYear() + '',
    Q: Math.floor((date.getMonth() + 3) / 3) + '',
    M: date.getMonth() + 1 + '',
    D: date.getDate() + '',
    h: date.getHours() + '',
    m: date.getMinutes() + '',
    s: date.getSeconds() + '',
    S: date.getMilliseconds() + ''
  };

  return format.replace(/(Y+|Q+|M+|W+|D+|h+|m+|s+|S+)/g, (target, key) => {
    key = key[0];
    let str = values[key];
    if (target.length > str.length) {
      return str.padStart(target.length, '0');
    } else if (key === 'Y') {
      return str.substr(-target.length);
    } else {
      return str;
    }
  });
}

function getChangedFiles() {
  let list = execSync('git status --porcelain -z -u', { encoding: 'utf8' }).trim().split('\0');
  return list
    .map(item => item.replace(/^\S+ /, ''))
    .filter(v => v)
    .sort();
}

function writeZipFile(files: string[], rootPath: string, name: string) {
  let zipFileName = `${name}.${ZIP_EXT_NAME}`;
  let zip = new AdmZip();
  // TODO: 适配 rootPath
  files
    .filter(v => !v.endsWith(ZIP_EXT_NAME)) // 过滤掉之前生成的 zip 文件, 避免文件越来越大
    .forEach(localPath => {
      let zipPath = path.dirname(localPath);
      if (zipPath === '.') {
        zipPath = '';
      }
      zip.addLocalFile(localPath, zipPath);
      console.log(`[zip] ${localPath}`);
    });
  zip.writeZip(zipFileName);
  console.log(`[created] ${zipFileName}`);
}
