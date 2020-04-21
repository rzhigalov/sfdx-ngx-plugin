import { JsonMap } from '@salesforce/ts-types';

import * as fs from 'fs-extra';

export const retrieveNgProjectJson = (path: string): Promise<JsonMap> => {
  return fs.readJSON(`${path}/angular.json`);
};
