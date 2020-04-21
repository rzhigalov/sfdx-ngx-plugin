import { SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { AnyJson, JsonMap } from '@salesforce/ts-types';

import * as fs from 'fs-extra';
import * as path from 'path';

import { NgxSettings } from '../../types/settings';
import { mergeConfigDefaults } from '../../util/config';
import { retry } from '../../util/misc';
import { retrieveNgProjectJson } from '../../util/ng';
import { parseSfdcApiVersion } from '../../util/sfdc';
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
    const projectPath = await this.project.getPath();
    const projectConfig = await this.project.retrieveSfdxProjectJson();
    const pluginSettings: NgxSettings = await mergeConfigDefaults(projectConfig.getContents());

    this.ux.styledHeader('Plugin Setup');

    pluginSettings.packageManager = await this.ux.prompt(
      messages.getMessage('packageManagerFlagDescription'),
      {
        default: pluginSettings.packageManager
      }
    );

    pluginSettings.buildScriptName = await this.ux.prompt(
      messages.getMessage('buildcmdFlagDescription'),
      {
        default: pluginSettings.buildScriptName
      }
    );

    pluginSettings.sfdcApiVersion = await retry(async () => {
      const ver = await this.ux.prompt(messages.getMessage('apiversionFlagDescription'), {
        default: pluginSettings.sfdcApiVersion
      });

      const apiVersion = parseSfdcApiVersion(ver);
      if (apiVersion) {
        return apiVersion;
      } else {
        this.ux.error(messages.getMessage('errorInvalidApiVersion', [`${ver}`]));
      }
    });

    pluginSettings.ngPath = await retry(() =>
      this.setAndValidateDir(
        messages.getMessage('ngPathFlagDescription'),
        pluginSettings.ngPath,
        projectPath
      )
    );

    const ngRootPath = path.join(projectPath, pluginSettings.ngPath);
    const suggestNgProject =
      pluginSettings.ngProject ??
      ((await retrieveNgProjectJson(ngRootPath))['defaultProject'] as string);
    pluginSettings.ngProject = await this.ux.prompt(
      messages.getMessage('ngProjectFlagDescription'),
      {
        default: suggestNgProject
      }
    );

    pluginSettings.sfdcPath = await retry(() =>
      this.setAndValidateDir(
        messages.getMessage('sfdcPathFlagDescription'),
        pluginSettings.sfdcPath,
        projectPath,
        true
      )
    );

    pluginSettings.sfdcVfPageName = await this.ux.prompt(
      messages.getMessage('sfdcPageFlagDescription'),
      {
        default: pluginSettings.sfdcVfPageName
      }
    );

    const suggestResourceName =
      pluginSettings.sfdcResourceName ?? `${pluginSettings.sfdcVfPageName}Resources`;
    pluginSettings.sfdcResourceName = await this.ux.prompt(
      messages.getMessage('sfdcResourceFlagDescription'),
      {
        default: suggestResourceName
      }
    );

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

  private async setAndValidateDir(
    message: string,
    defaultValue: string,
    rootPath: string,
    promptCreate?: boolean
  ) {
    const dirPath = await this.ux.prompt(message, {
      default: defaultValue
    });

    const dirRootPath = path.join(rootPath, dirPath);
    if (fs.existsSync(dirRootPath)) {
      return dirPath;
    } else {
      this.ux.error(messages.getMessage('errorUnresolvableDir', [`${dirPath}`]));

      if (promptCreate && (await this.ux.confirm(messages.getMessage('promptCreateDir')))) {
        await fs.ensureDir(dirRootPath);
        return dirPath;
      }
    }
  }
}
