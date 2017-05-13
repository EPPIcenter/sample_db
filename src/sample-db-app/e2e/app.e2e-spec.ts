import { SampleDbAppPage } from './app.po';

describe('sample-db-app App', () => {
  let page: SampleDbAppPage;

  beforeEach(() => {
    page = new SampleDbAppPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
