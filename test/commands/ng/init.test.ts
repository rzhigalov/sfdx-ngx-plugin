import { expect, test } from '@salesforce/command/lib/test';

describe('ngx:init', () => {
  test
    .withProject({})
    .stdout()
    .command(['ngx:init'])
    .it('runs ngx:org', ctx => {
      expect(ctx.stdout).to.contain('Plugin set up and ready to go!');
    });
});
