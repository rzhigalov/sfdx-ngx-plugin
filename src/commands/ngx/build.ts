import { flags, SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';

import { NgxSettings } from '../../types/settings';
import { mergeConfigDefaults } from '../../util/config';

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

    // Return an object to be displayed with --json
    const statusMessage = 'Angular project built and packed for SFDC deployment!';
    this.ux.log(`\n${statusMessage}`);

    // Return an object to be displayed with --json
    return {
      success: true,
      message: statusMessage
    };
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
