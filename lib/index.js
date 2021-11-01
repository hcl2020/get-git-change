"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const adm_zip_1 = __importDefault(require("adm-zip"));
const ZIP_EXT_NAME = 'ggc.zip';
(function main() {
    const rootPath = getRootPath();
    const dirname = rootPath.split(path_1.default.sep).pop();
    const name = `${dirname}_${dateFormat(new Date())}`;
    const files = getChangedFiles();
    writeZipFile(files, rootPath, name);
})();
function getRootPath() {
    let gitPath = (0, child_process_1.execSync)('git rev-parse --show-cdup', { encoding: 'utf8' }).trim();
    return path_1.default.join(process.cwd(), gitPath).replace(/\/$/, '');
}
function dateFormat(date, format = 'YYYYMMDD-hhmmss') {
    if (!date) {
        return '';
    }
    if (typeof date == 'number') {
        date = new Date(date * 1000);
    }
    let values = {
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
        }
        else if (key === 'Y') {
            return str.substr(-target.length);
        }
        else {
            return str;
        }
    });
}
function getChangedFiles() {
    let list = (0, child_process_1.execSync)('git status --porcelain -z -u', { encoding: 'utf8' }).trim().split('\0');
    return list
        .map(item => item.replace(/^\S+ /, ''))
        .filter(v => v)
        .sort();
}
function writeZipFile(files, rootPath, name) {
    let zipFileName = `${name}.${ZIP_EXT_NAME}`;
    let zip = new adm_zip_1.default();
    files
        .filter(v => !v.endsWith(ZIP_EXT_NAME))
        .forEach(localPath => {
        let zipPath = path_1.default.dirname(localPath);
        if (zipPath === '.') {
            zipPath = '';
        }
        zip.addLocalFile(localPath, zipPath);
        console.log(`[zip] ${localPath}`);
    });
    zip.writeZip(zipFileName);
    console.log(`[created] ${zipFileName}`);
}
