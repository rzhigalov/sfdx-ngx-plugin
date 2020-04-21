sfdx-ngx-plugin
======================

SFDX plugin for Angular apps deployment on Salesforce

[![Version](https://img.shields.io/npm/v/sfdx-ngx-plugin.svg)](https://npmjs.org/package/sfdx-ngx-plugin)
[![Downloads/week](https://img.shields.io/npm/dw/sfdx-ngx-plugin.svg)](https://npmjs.org/package/sfdx-ngx-plugin)
[![License](https://img.shields.io/npm/l/sfdx-ngx-plugin.svg)](https://github.com/rzhigalov/sfdx-ngx-plugin/blob/master/package.json)


<div style="padding: 10px;background: rgba(227, 98, 9, 0.5);">
  <div>⚠️ This package is yet in <b>beta</b> version and may not work in <i>all</i> cases.</div>
  <div>Please, create an <a href="https://github.com/rzhigalov/sfdx-ngx-plugin/issues/new" target="_blank">issue</a> if you encountered any issues</div>
</div>

<!-- install -->
### Prerequesites
1. [SFDX](https://developer.salesforce.com/tools/sfdxcli)
2. [Angular CLI](https://cli.angular.io/)

## Installation

### Install as plugin

`sfdx plugins:install sfdx-ngx-plugin`

### Install from source

1. Clone repository  
   `git@github.com:rzhigalov/sfdx-ngx-plugin.git`
2. Open cloned folder  
   `cd path/to/cloned/repo`
3. Install npm modules  
  `npm install` or `yarn install`
3. Link the plugin  
   `sfdx plugins:link .`

## Usage
### General flow
1. [Setup SFDX project](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_ws_create_new.htm)
   e.g. `sfdx force:project:create -n ProjectName --template standard`)
2. Create scratch org or configure persistent instance
3. Initialize Angular project  
   e.g. `ng new my-shiny-metal-project`
4. Run `sfdx ngx:init` and follow the prompts
5. (_optional_) Configure `vf.template.page` with controller and Visualforce page appearance
6. Run `sfdx ngx:build`
7. Deploy code to Salesforce (`sfdx force:source:deploy` or `sfdx force:source:push`)

---
#### `sfdx ngx:init`
Initializes files and settings for plugin
```
USAGE
  $ sfdx ngx:init [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  --json                                                                            format output as json
  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for this command invocation

EXAMPLE
  $ sfdx ngx:init
    Starts plugin configuration wizard
```

#### `sfdx ngx:build`
Builds Angular project and packs for SFDC deployment
```
USAGE
  $ sfdx ngx:build [-b <string>] [-m npm|yarn|pnpm] [-p <directory>] [--ngproject <directory>] [-t <directory>] [--sfdcpage <string>] [--sfdcresource <string>] [--apiversion <string>] [--json] [--loglevel
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -b, --buildcmd=buildcmd                                                           Angular build command
  -m, --packagemanager=(npm|yarn|pnpm)                                              Used package manager (npm, yarn, pnpm)
  -p, --ngpath=ngpath                                                               Relative path to Angular project (folder with angular.json)
  -t, --sfdcpath=sfdcpath                                                           Relative path to SFDC target dir
  --apiversion=apiversion                                                           SFDC API version
  --ngproject=ngproject                                                             Angular Project name
  --sfdcpage=sfdcpage                                                               SFDC Static Visualforce page name
  --sfdcresource=sfdcresource                                                       SFDC Static Resource name
  --json                                                                            format output as json
  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for this command invocation

EXAMPLES
  # Uses initialized plugin settings
  $ sfdx ngx:build

       === Building Angular project for SFDC
       ...
       Creating Angular SFDC application... Done

       Angular project built and packed for SFDC deployment!


  # Flag overrides take precedence over plugin settings
  # After plugin will finish execution you will be offered to update plugin settings
  $ sfdx ngx:build
     -b build:sfdc (--buildcmd=build:commandname)
     -m yarn (--packagemanager=(npm|yarn|pnpm))
     -p client (--ngpath=relative/path/to/angular-app)
     -t forceApp/main/ngApp (--sfdcpath=relative/path/to/sfdc-folder)
     --apiversion 42.0
     --ngproject ng-app-name
     --sfdcpage PageName
     --sfdcresource StaticResourceName
```
