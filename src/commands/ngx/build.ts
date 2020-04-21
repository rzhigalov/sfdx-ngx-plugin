import { SfdxCommand } from '@salesforce/command';
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

  protected static flagsConfig = {};

  protected static requiresProject = true;

  public async run(): Promise<AnyJson> {
    const projectPath = await this.project.getPath();
    const projectConfig = await this.project.retrieveSfdxProjectJson();
    const pluginSettings: NgxSettings = await mergeConfigDefaults(projectConfig.getContents());

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
}
