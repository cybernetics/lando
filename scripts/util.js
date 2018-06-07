'use strict';

const _ = require('lodash');
const semver = require('semver');
const path = require('path');

/*
 * Bumps a version by release type
 */
exports.bumpVersion = (version, type = 'patch', prerelease = 'beta') => {
  switch (type) {
    case 'prerelease':
      return semver.inc(version, 'prerelease', prerelease);
    case 'patch':
      return semver.inc(version, 'patch');
    case 'minor':
      return semver.inc(version, 'minor');
    case 'major':
      return semver.inc(version, 'major');
    default:
      return semver.inc(version, 'patch');
  }
};

/*
 * Returns the target OS
 */
exports.cliTargetOs = () => {
  switch (process.platform) {
    case 'darwin':
      return 'macos';
    case 'linux':
      return 'linux';
    case 'win32':
      return 'win';
    default:
      return 'linux';
  }
};

/*
 * Constructs the CLI PKG task
 */
exports.cliPkgTask = output => {
  // Package command
  const pkgCmd = [
    'node',
    path.resolve(__dirname, '..', 'node_modules', '.bin', 'pkg'),
    '--targets ' + ['node8', exports.cliTargetOs(), 'x64'].join('-'),
    '--config ' + path.join('package.json'),
    '--output ' + output,
    path.join('bin', 'lando.js'),
  ];

  // Start to build the command
  const cmd = [];
  cmd.push('yarn --production');
  cmd.push(pkgCmd.join(' '));

  // Add executable perms on POSIX
  if (process.platform !== 'win32') {
    cmd.push('chmod +x ' + output);
    cmd.push('sleep 2');
  }

  // Return the CLI build task
  return cmd;
};

/*
 * Fixes a jsdoc2md alias
 */
exports.fixAlias = datum => {
  const needsWrapping = s => !_.startsWith(s, '\'') && !_.endsWith(s, '\'') && _.includes(s, 'lando.');
  if (_.has(datum, 'alias') && needsWrapping(datum.alias)) {
    if (_.startsWith(datum.alias, 'lando.')) {
      datum.name = datum.alias;
      datum.kind = 'function';
      datum.scope = 'global';
      delete datum.memberof;
    }
  }
  return datum;
};

/*
 * Fixes a jsdoc2md alias
 */
exports.parseCommand = (cmd, cwd = path.resolve(__dirname, '..')) => {
  return {run: cmd.split(' '), opts: {mode: 'collect', cwd}};
};

/*
 * Run a ps script
 */
exports.psTask = cmd => (['PowerShell -NoProfile -ExecutionPolicy Bypass -Command', cmd, '&& EXIT /B %errorlevel%']);

/*
 * Installer pacakge task
 */
exports.installerPkgTask = () => {
  const extension = (process.platform === 'win32') ? 'ps1' : 'sh';
  const script = path.join('scripts', `build-${process.platform}.${extension}`);
  return (extension === 'ps1') ? exports.psTask(script) : script;
};
