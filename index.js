#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const child_process = require('child_process');

const pak = require('./package.json');

const hooks = [
  'applypatch-msg',
  'pre-applypatch',
  'post-applypatch',
  'pre-commit',
  'pre-merge-commit',
  'prepare-commit-msg',
  'commit-msg',
  'post-commit',
  'pre-rebase',
  'post-checkout',
  'post-merge',
  'pre-push',
  'reference-transaction',
  'push-to-checkout',
  'pre-auto-gc',
  'post-rewrite',
  'sendemail-validate',
  'fsmonitor-watchman',
  'p4-changelist',
  'p4-prepare-changelist',
  'p4-post-changelist',
  'p4-pre-submit',
  'post-index-change',
];

let hooksPath;

try {
  hooksPath = child_process
    .execSync('git config core.hooksPath', {
      encoding: 'utf8',
    })
    .trim();
} catch (e) {
  // Ignore
}

hooksPath = path.join(process.cwd(), hooksPath || '.git/hooks');

function install() {
  if (!fs.existsSync(hooksPath)) {
    fs.mkdirSync(hooksPath, { recursive: true });
  }

  for (const hook of hooks) {
    const hookPath = path.join(hooksPath, hook);

    fs.writeFileSync(
      hookPath,
      `#!/usr/bin/env node

/**
 * Created by ${pak.name}@${pak.version}
 */

const path = require('path');
const fs = require('fs');
const child_process = require('child_process');

const pak = JSON.parse(fs.readFileSync('package.json'));
const hooks = pak[${JSON.stringify(pak.name)}];
const script = hooks[${JSON.stringify(hook)}];

if (!script) {
  return;
}

try {
  child_process.execSync(script, {
    stdin: 'inherit',
    stdio: 'inherit',
    stderr: 'inherit',
    env: {
      ...process.env,
      PATH:
        path.resolve('./node_modules/.bin') +
        (process.platform === 'win32' ? ';' : ':') +
        process.env.PATH,
      GIT_HOOKS_PARAMS: process.argv.slice(2).join(' '),
    },
  });
} catch (e) {
  if (typeof e.status === 'number') {
    process.stderr.write(
      '${hook} hook failed (add --no-verify to bypass)\\n'
    );
    process.exit(e.status);
  } else {
    throw e;
  }
}
`
    );

    if (process.platform === 'win32') {
      fs.writeFileSync(
        `${hookPath}.cmd`,
        '@echo off\r\n\r\nnode "%~dp0\\' + hook + '" %*\r\n'
      );
    } else {
      try {
        child_process.execSync(`chmod +x "${hookPath}"`);
      } catch (e) {
        // Ignore
      }
    }
  }
}

function uninstall() {
  for (const hook of hooks) {
    const hookPath = path.join(hooksPath, hook);

    if (fs.existsSync(hookPath)) {
      fs.rmSync(hookPath);
    }

    if (process.platform === 'win32') {
      const hookPathCmd = `${hookPath}.cmd`;

      if (fs.existsSync(hookPathCmd)) {
        fs.rmSync(hookPathCmd);
      }
    }
  }
}

function run() {
  const [command] = process.argv.slice(2);

  switch (command) {
    case 'install':
      install();
      break;
    case 'uninstall':
      uninstall();
      break;
    default:
      throw new Error(`Invalid argument ${command}`);
  }
}

run();
