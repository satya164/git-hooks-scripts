# git-hooks-scripts

[![Version][version-badge]][package]
[![MIT License][license-badge]][license]

Run custom scripts as Git hooks.

## Usage

Add your scripts under a section called `git-hooks-scripts` in your `package.json` file:

```json
"git-hooks-scripts": {
  "pre-commit": "eslint ."
}
```

You can also get arguments from Git via the `GIT_HOOKS_PARAMS` environment variable. For example, to setup `commitlint`, you can do the following:

```json
"git-hooks-scripts": {
  "commit-msg": "commitlint -E GIT_HOOKS_PARAMS"
}
```

<!-- badges -->

[version-badge]: https://img.shields.io/npm/v/git-hooks-scripts.svg?style=flat-square
[package]: https://www.npmjs.com/package/git-hooks-scripts
[license-badge]: https://img.shields.io/npm/l/git-hooks-scripts.svg?style=flat-square
[license]: https://opensource.org/licenses/MIT
