![Logo](admin/vistabbar.png)
# ioBroker.vistabbar

[![NPM version](http://img.shields.io/npm/v/iobroker.vistabbar.svg)](https://www.npmjs.com/package/iobroker.vistabbar)
[![Downloads](https://img.shields.io/npm/dm/iobroker.vistabbar.svg)](https://www.npmjs.com/package/iobroker.vistabbar)
![Number of Installations (latest)](http://iobroker.live/badges/vistabbar-installed.svg)
![Number of Installations (stable)](http://iobroker.live/badges/vistabbar-stable.svg)
[![Dependency Status](https://img.shields.io/david/mbecker/iobroker.vistabbar.svg)](https://david-dm.org/mbecker/iobroker.vistabbar)
[![Known Vulnerabilities](https://snyk.io/test/github/mbecker/ioBroker.vistabbar/badge.svg)](https://snyk.io/test/github/mbecker/ioBroker.vistabbar)

[![NPM](https://nodei.co/npm/iobroker.vistabbar.png?downloads=true)](https://nodei.co/npm/iobroker.vistabbar/)

## Fork

Forked from: [https://github.com/ErlendEllingsen/app-tab-bar](https://github.com/ErlendEllingsen/app-tab-bar)

## vistabbar adapter for ioBroker

Mobile tab bar

## Developer manual
This section is intended for the developer. It can be deleted later

### Getting started

You are almost done, only a few steps left:
1. Create a new repository on GitHub with the name `ioBroker.vistabbar`
1. Initialize the current folder as a new git repository:  
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    ```
1. Link your local repository with the one on GitHub:  
    ```bash
    git remote add origin https://github.com/mbecker/ioBroker.vistabbar
    ```

1. Push all files to the GitHub repo:  
    ```bash
    git push origin master
    ```
1. Head over to [widgets/vistabbar.html](widgets/vistabbar.html) and start programming!

### Scripts in `package.json`
Several npm scripts are predefined for your convenience. You can run them using `npm run <scriptname>`
| Script name | Description                                              |
|-------------|----------------------------------------------------------|
| `test:package`    | Ensures your `package.json` and `io-package.json` are valid. |
| `test` | Performs a minimal test run on package files. |

### Publishing the widget
To get your widget released in ioBroker, please refer to the documentation 
of [ioBroker.repositories](https://github.com/ioBroker/ioBroker.repositories#requirements-for-adapter-to-get-added-to-the-latest-repository).

### Test the adapter manually on a local ioBroker installation
In order to install the adapter locally without publishing, the following steps are recommended:
1. Create a tarball from your dev directory:  
    ```bash
    npm pack
    ```
1. Upload the resulting file to your ioBroker host
1. Install it locally (The paths are different on Windows):
    ```bash
    cd /opt/iobroker
    npm i /path/to/tarball.tgz
    ```

For later updates, the above procedure is not necessary. Just do the following:
1. Overwrite the changed files in the adapter directory (`/opt/iobroker/node_modules/iobroker.vistabbar`)
1. Execute `iobroker upload vistabbar` on the ioBroker host

## Changelog

### 0.0.1
* (mbecker) initial release

## License
MIT License

Copyright (c) 2020 mbecker <mats.becker@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.