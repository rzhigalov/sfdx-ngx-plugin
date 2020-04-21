import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, SfdxError } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';

import * as child_process from 'child_process';
import * as fs from 'fs-extra';
import * as path from 'path';

import { NgxSettings } from '../../types/settings';
import { mergeConfigDefaults } from '../../util/config';
import {
  SFDC_DEPLOY_TOKEN,
  SFDC_PAGE_META_CONTENT,
  SFDC_RESOURCE_META_CONTENT,
  VF_TEMPLATE_FILENAME
} from '../../util/tokens';
import * as vfTransform from '../../util/visualforceTransform';
import { composeStaticResourceUrl } from '../../util/sfdc';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('sfdx-ngx-plugin', 'ngx');

export default class NgxBuild extends SfdxCommand {
  public static description = messages.getMessage('buildCommandDescription');

  public static examples = [
    `$ sfdx ngx:build

    ADD EXAMPLE OUTPUT
  `,
    `
    ADD EXTENDED EXAMPLE DESCRIPTION
  `
  ];

  protected static flagsConfig = {
    buildcmd: flags.string({
      char: 'b',
      description: messages.getMessage('buildcmdFlagDescription')
    }),
    packagemanager: flags.enum({
      char: 'm',
      description: messages.getMessage('packageManagerFlagDescription'),
      options: ['npm', 'yarn', 'pnpm']
    }),
    apiversion: flags.builtin({
      description: messages.getMessage('apiversionFlagDescription')
    }),
    path: flags.directory({
      char: 'p',
      description: messages.getMessage('ngPathFlagDescription')
    }),
    ngproject: flags.directory({
      description: messages.getMessage('ngProjectFlagDescription')
    }),
    target: flags.directory({
      char: 't',
      description: messages.getMessage('sfdcPathFlagDescription')
    }),
    sfdcpage: flags.string({
      description: messages.getMessage('sfdcPageFlagDescription')
    }),
    sfdcresource: flags.string({
      description: messages.getMessage('sfdcResourceFlagDescription')
    })
  };

  protected static requiresProject = true;

  public async run(): Promise<AnyJson> {
    const projectPath = await this.project.getPath();
    const projectConfig = await this.project.retrieveSfdxProjectJson();
    const pluginSettings: NgxSettings = this.overrideConfig(
      await mergeConfigDefaults(projectConfig.getContents()),
      this.flags
    );

    this.ux.styledHeader('Building Angular project for SFDC');

    const buildExitCode = await this.buildAngularProject(projectPath, pluginSettings);
    if (buildExitCode) {
      throw new SfdxError(messages.getMessage('errorBuildFailed'));
    }

    await this.buildSfdcSources(projectPath, pluginSettings);

    // Return an object to be displayed with --json
    const statusMessage = 'Angular project built and packed for SFDC deployment!';
    this.ux.log(`\n${statusMessage}`);

    // Return an object to be displayed with --json
    return {
      success: true,
      message: statusMessage
    };
  }

  private checkAngularProject(ngDirPath: string): void {
    if (!fs.existsSync(ngDirPath)) {
      throw new SfdxError(messages.getMessage('errorUnresolvableDir', [ngDirPath]));
    }

    const angularJsonPath = path.resolve(ngDirPath, 'angular.json');
    const isAngularProject = fs.existsSync(angularJsonPath);
    if (!isAngularProject) {
      throw new SfdxError(messages.getMessage('errorUnresolvableAngularProject', [ngDirPath]));
    }
  }

  private async buildAngularProject(rootPath: string, settings: NgxSettings): Promise<number> {
    const ngDirPath = path.join(rootPath, settings.ngPath);
    this.checkAngularProject(ngDirPath);

    const buildProcess = child_process.spawn(
      settings.packageManager,
      ['run', settings.buildScriptName, `--deployUrl=${SFDC_DEPLOY_TOKEN}`],
      {
        cwd: ngDirPath,
        stdio: 'inherit'
      }
    );

    return new Promise((resolve, reject) => {
      buildProcess.on('close', resolve);
    });
  }

  private async buildSfdcSources(projectPath: string, pluginSettings: NgxSettings) {
    const ngDirPath = path.resolve(projectPath, pluginSettings.ngPath);
    const ngProjectPath = path.resolve(ngDirPath, 'dist', pluginSettings.ngProject);
    const sfdcDirPath = path.resolve(projectPath, pluginSettings.sfdcPath);
    const staticResourcePath = path.join(
      sfdcDirPath,
      'staticresources',
      pluginSettings.sfdcResourceName
    );
    const vfPagePath = path.join(sfdcDirPath, 'pages', pluginSettings.sfdcVfPageName);

    this.ux.startSpinner('Creating Angular SFDC application');

    this.ux.setSpinnerStatus('Preparing folders');
    await fs.ensureDir(sfdcDirPath);
    await fs.ensureDir(path.join(sfdcDirPath, 'pages'));
    await fs.remove(staticResourcePath);
    await fs.ensureDir(staticResourcePath);

    this.ux.setSpinnerStatus('Updating lazy scripts runtime path');
    await vfTransform.updateLoadedScriptsPath(ngProjectPath);

    this.ux.setSpinnerStatus('Moving Angular dist');
    await fs.copy(ngProjectPath, staticResourcePath);
    await fs.writeFile(`${staticResourcePath}.resource-meta.xml`, SFDC_RESOURCE_META_CONTENT);

    this.ux.setSpinnerStatus('Preparing Visualforce Page');

    await this.transformVfPage(
      path.join(staticResourcePath, 'index.html'),
      path.join(projectPath, VF_TEMPLATE_FILENAME),
      pluginSettings.sfdcResourceName
    );

    await fs.move(path.join(staticResourcePath, 'index.html'), path.resolve(`${vfPagePath}.page`), {
      overwrite: true
    });
    await fs.writeFile(
      `${vfPagePath}.page-meta.xml`,
      SFDC_PAGE_META_CONTENT(pluginSettings.sfdcApiVersion, pluginSettings.sfdcVfPageName)
    );

    this.ux.stopSpinner('Done');
  }

  private async transformVfPage(vfPagePath: string, vfTemplatePath: string, staticResourceName: string): Promise<void> {
    let vfPage: string;
    const staticResourceUrl = composeStaticResourceUrl(staticResourceName);
    const html = await fs.readFile(vfPagePath, 'utf8');
    const vfTemplate = await fs.readFile(vfTemplatePath, 'utf8');

    this.ux.setSpinnerStatus('Transforming html to Visualforce');
    vfPage = vfTransform.wrapIntoVfPage(html, vfTemplate);
    this.ux.setSpinnerStatus('Sanitizing tags');
    vfPage = vfTransform.sanitizeTags(vfPage);
    return fs.writeFile(vfPagePath, vfPage);
  }

  private overrideConfig(settings: NgxSettings, processFlags): NgxSettings {
    if (processFlags.buildcmd) {
      settings.buildScriptName = processFlags.buildcmd;
    }
    if (processFlags.packagemanager) {
      settings.packageManager = processFlags.packagemanager;
    }
    if (processFlags.apiversion) {
      settings.sfdcApiVersion = processFlags.apiversion;
    }
    if (processFlags.path) {
      settings.ngPath = processFlags.path;
    }
    if (processFlags.ngproject) {
      settings.ngProject = processFlags.ngprojects;
    }
    if (processFlags.target) {
      settings.sfdcPath = processFlags.target;
    }
    if (processFlags.sfdcpage) {
      settings.sfdcVfPageName = processFlags.lasfdcpa;
    }
    if (processFlags.sfdcresource) {
      settings.sfdcResourceName = processFlags.sfdcresource;
    }

    return settings;
  }
}
