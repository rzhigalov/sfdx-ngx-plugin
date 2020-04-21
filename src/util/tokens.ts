export const PLUGIN_NAMESPACE = 'ngx';

export const VF_TEMPLATE_FILENAME = 'vf.template.page';
export const VF_TEMPLATE_CONTENT_TOKEN = '%%NG_CONTENT%%';
export const VF_TEMPLATE_CONTENT =
`<apex:page showHeader="false" sidebar="false" standardStylesheets="false" docType="html-5.0" applyHtmlTag="false" applyBodyTag="false" cache="false">
    ${VF_TEMPLATE_CONTENT_TOKEN}
</apex:page>`;
