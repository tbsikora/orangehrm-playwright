import type { Locator, Page } from '@playwright/test';
import { URLS } from '../const/selectors/urls';

export class BuzzPage {
  readonly page: Page;
  readonly url = URLS.buzz;
  readonly postTextarea: Locator;
  readonly postButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.postTextarea = page.getByTestId('buzz-post-textarea');
    this.postButton = page.getByTestId('buzz-post-button');
  }

  async goto() {
    await this.page.goto(this.url);
    await this.postTextarea.waitFor();
    await this.page.waitForTimeout(1500);
  }

  async writePost(text: string) {
    await this.postTextarea.click();
    await this.postTextarea.evaluate((el: HTMLTextAreaElement, value: string) => {
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        'value',
      )?.set;
      nativeSetter?.call(el, value);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }, text);
  }
}
