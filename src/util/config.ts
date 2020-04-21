import { JsonMap } from '@salesforce/ts-types';
import { NgxSettings } from '../types/settings';
import { PLUGIN_NAMESPACE } from './tokens';

export const DEFAULT_SFDC_DIR = 'forceApp/main/default';
export const DEFAULT_SFDC_VFPAGE_NAME = 'ngxSfdc';

export const getPluginConfig = (projectSettings: JsonMap): NgxSettings =>
  (projectSettings.plugins && { ...projectSettings.plugins[PLUGIN_NAMESPACE]}) || {};

export const mergeConfigDefaults = (projectSettings: JsonMap): NgxSettings => {
  const settings: NgxSettings = getPluginConfig(projectSettings);

  settings.packageManager = settings.packageManager || 'npm';
  settings.buildScriptName = settings.buildScriptName || 'build';
  settings.sfdcApiVersion = settings.sfdcApiVersion || (projectSettings.sourceApiVersion as string);

  settings.sfdcPath = settings.sfdcPath || DEFAULT_SFDC_DIR;
  settings.sfdcVfPageName = settings.sfdcVfPageName || DEFAULT_SFDC_VFPAGE_NAME;
  settings.sfdcResourceName = settings.sfdcResourceName;

  return settings;
};
