// tslint:disable-next-line no-var-requires
const replaceInFiles = require('replace-in-file');

import {
  SFDC_DEPLOY_TOKEN,
  SFDC_RUNTIME_RESOURCE_TOKEN,
} from './tokens';
export const updateLoadedScriptsPath = async (scriptDirPath: string): Promise<any> => {
  return replaceInFiles({
    files: `${scriptDirPath}/**/*.js`,
    from: `"${SFDC_DEPLOY_TOKEN}"`,
    to: SFDC_RUNTIME_RESOURCE_TOKEN
  });
};
