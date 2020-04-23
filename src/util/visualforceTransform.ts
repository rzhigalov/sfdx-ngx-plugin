// Have to use `require` as package has no callable export
// tslint:disable-next-line no-var-requires
const replaceInFile = require('replace-in-file');
import { ReplaceResult } from 'replace-in-file';

import {
  SFDC_DEPLOY_TOKEN,
  SFDC_RUNTIME_RESOURCE_TOKEN,
  VF_PAGE_DEFER_INIT_SCRIPT,
  VF_PAGE_SCRIPTS,
  VF_TEMPLATE_CONTENT_TOKEN
} from './tokens';

export const checkBuildValidity = (html: string): boolean => {
  return html.indexOf(SFDC_DEPLOY_TOKEN) !== -1;
}

export const createLegacyScriptsInitializer = (html: string): string => {
  // Collect es5 src references
  const nomoduleScripts = [];
  const nomoduleRegex = /<script[^>]*src="([^"]*?)"[^>]*(nomodule|defer)[^>]*><\/script>/g;
  let match = nomoduleRegex.exec(html);
  while (match !== null) {
    nomoduleScripts.push({
      scriptSrc: match[1],
      defer: match[0].includes('defer'),
      nomodule: match[0].includes('nomodule')
    });
    match = nomoduleRegex.exec(html);
  }
  // Remove es5 bundles as SFDC does not support boolean `nomodule` arrtibute
  html = html.replace(nomoduleRegex, '');

  const bodyIdx = html.indexOf('</body>');
  return `${html.slice(0, bodyIdx)}${VF_PAGE_DEFER_INIT_SCRIPT(nomoduleScripts)}${html.slice(
    bodyIdx
  )}`;
};

export const sanitizeTags = (html: string): string => {
  // Convert non-closed tags into self-closing tags
  const openTagRegexp = /<(link|base|meta).+?[^\/]>/g;
  let match = openTagRegexp.exec(html);
  while (match !== null) {
    html =
      `${html.slice(0, match.index + match[0].length - 1)}/>\n` +
      html.slice(match.index + match[0].length);
    match = openTagRegexp.exec(html);
  }

  return html;
};

export const updateDeployUrl = (html: string, staticResourceUrl: string): string => {
  html = html.split('</head>').join(VF_PAGE_SCRIPTS + '\n</head>');
  return html.split(SFDC_DEPLOY_TOKEN).join(staticResourceUrl);
};

export const updateLoadedScriptsPath = async (scriptDirPath: string): Promise<ReplaceResult[]> => {
  return replaceInFile({
    files: `${scriptDirPath}/**/*.js`,
    from: `"${SFDC_DEPLOY_TOKEN}"`,
    to: SFDC_RUNTIME_RESOURCE_TOKEN
  });
};

export const wrapIntoVfPage = (html: string, template: string): string => {
  html = html.slice('<!doctype html>'.length);
  return template.replace(VF_TEMPLATE_CONTENT_TOKEN, html);
};
