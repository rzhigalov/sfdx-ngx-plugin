export const parseSfdcApiVersion = (v: string | number): string => {
  if (typeof v === 'string') {
    const m = /\d+/.exec(v);
    if (m !== null) {
      v = parseInt(m[0], 10);
    }
  }
  return !isNaN(Number(v)) ? `${v}.0` : null;
};

export const composeStaticResourceUrl = (resourceName: string) => `{!URLFOR($Resource.${resourceName})}/`;
