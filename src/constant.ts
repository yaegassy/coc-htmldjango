import fs from 'fs';
import path from 'path';
import toml from 'toml';

type PyprojectToml = {
  tool: {
    poetry: {
      dependencies: {
        [name: string]: string;
      };
    };
  };
};

function getPackageVersion(name: string) {
  const rootDir = path.resolve(path.dirname(__filename), '..');
  const filePath = path.join(rootDir, 'pyproject.toml');
  const fileStr = fs.readFileSync(filePath);
  const data: PyprojectToml = toml.parse(fileStr);
  const version = data.tool.poetry.dependencies[name];

  return version;
}

export const DJHTML_VERSION = getPackageVersion('djhtml');
export const DJLINT_VERSION = getPackageVersion('djlint');

export const SUPPORT_LANGUAGES = ['htmldjango'];
