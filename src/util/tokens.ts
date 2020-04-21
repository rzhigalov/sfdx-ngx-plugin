export const PLUGIN_NAMESPACE = 'ngx';

export const SFDC_DEPLOY_TOKEN = '%%SFDC_RESOURCE_TOKEN%%';
export const SFDC_RUNTIME_RESOURCE_TOKEN = '__SFDC_RESOURCE_TOKEN__';
export const SFDC_PAGE_META_CONTENT = (apiVersion: string, pageName: string) =>
  `<?xml version="1.0" encoding="UTF-8"?>
<ApexPage xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>${apiVersion}</apiVersion>
    <availableInTouch>true</availableInTouch>
    <confirmationTokenRequired>false</confirmationTokenRequired>
    <label>${pageName}</label>
</ApexPage>
`;

export const SFDC_RESOURCE_META_CONTENT = `<StaticResource xmlns="http://soap.sforce.com/2006/04/metadata">
    <cacheControl>Public</cacheControl>
    <contentType>application/zip</contentType>
    <description>Angular SPA resources</description>
</StaticResource>
`;

export const VF_TEMPLATE_FILENAME = 'vf.template.page';
export const VF_TEMPLATE_CONTENT_TOKEN = '%%NG_CONTENT%%';
export const VF_TEMPLATE_CONTENT = `<apex:page showHeader="false" sidebar="false" standardStylesheets="false" docType="html-5.0" applyHtmlTag="false" applyBodyTag="false" cache="false">
    ${VF_TEMPLATE_CONTENT_TOKEN}
</apex:page>
`;
export const VF_PAGE_SCRIPTS = `
  <script>
    var ${SFDC_RUNTIME_RESOURCE_TOKEN} = "${SFDC_DEPLOY_TOKEN}";
  </script>
`;
export const VF_PAGE_DEFER_INIT_SCRIPT = (nomoduleScripts: string[]) => `
<script>
  var nms = ${JSON.stringify(nomoduleScripts)};
  nms.forEach(function (s, si) {
  var st = document.createElement('script');
  st.setAttribute('src', s.scriptSrc);
  if (s.nomodule) { st.setAttribute('nomodule', ''); }
  if (s.defer){ st.setAttribute('defer', ''); }
  document.body.appendChild(st);
  });
</script>
`;
