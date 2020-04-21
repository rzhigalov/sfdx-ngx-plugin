import { SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { AnyJson, JsonMap } from '@salesforce/ts-types';

import { NgxSettings } from '../../types/settings';
import { mergeConfigDefaults } from '../../util/config';
import { PLUGIN_NAMESPACE } from '../../util/tokens';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('sfdx-ngx-plugin', 'ngx');

export default class Ngx extends SfdxCommand {
  public static description = messages.getMessage('initCommandDescription');

  public static examples = [
    `$ sfdx ngx:init
 Starts plugin configuration wizard
  `
  ];

  protected static flagsConfig = {};

  protected static requiresProject = true;

  public async run(): Promise<AnyJson> {
    const projectConfig = await this.project.retrieveSfdxProjectJson();
    const pluginSettings: NgxSettings = await mergeConfigDefaults(projectConfig.getContents());

    this.ux.styledHeader('Plugin Setup');

    // Save new plugin configuration
    projectConfig.set(`plugins.${PLUGIN_NAMESPACE}`, (pluginSettings as unknown) as JsonMap);
    await projectConfig.write(projectConfig.getContents());

    const statusMessage = 'Plugin set up and ready to go!';
    this.ux.log(`\n${statusMessage}`);

    // Return an object to be displayed with --json
    return {
      success: true,
      message: statusMessage
    };
  }
}
