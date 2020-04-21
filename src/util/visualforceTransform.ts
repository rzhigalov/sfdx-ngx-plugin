// tslint:disable-next-line no-var-requires
const replaceInFiles = require('replace-in-file');

import {
  SFDC_DEPLOY_TOKEN,
  SFDC_RUNTIME_RESOURCE_TOKEN,
  VF_PAGE_SCRIPTS,
  VF_TEMPLATE_CONTENT_TOKEN
} from './tokens';

export const sanitizeTags = (html: string): string => {
  // Convert non-closed tags into self-closing tags
  const openTagRegexp = /<(link|base).+?[^/]>/g;
  let match = openTagRegexp.exec(html);
  while (match !== null) {
    html =
      `${html.slice(0, match.index + match[0].length - 1)}/>\n` +
      html.slice(match.index + match[0].length);
    match = openTagRegexp.exec(html);
  }

  return html;
};

export const wrapIntoVfPage = (html: string, template: string): string => {
  html = html.slice('<!doctype html>'.length);
  return template.replace(VF_TEMPLATE_CONTENT_TOKEN, html);
};

export const updateDeployUrl = (html: string, staticResourceUrl: string): string => {
  html = html.split('</head>').join(VF_PAGE_SCRIPTS + '\n</head>');
  return html.split(SFDC_DEPLOY_TOKEN).join(staticResourceUrl);
};

export const updateLoadedScriptsPath = async (scriptDirPath: string): Promise<any> => {
  return replaceInFiles({
    files: `${scriptDirPath}/**/*.js`,
    from: `"${SFDC_DEPLOY_TOKEN}"`,
    to: SFDC_RUNTIME_RESOURCE_TOKEN
  });
};
