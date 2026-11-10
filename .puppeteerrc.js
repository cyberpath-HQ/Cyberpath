import {join} from 'path';

/**
 * @type {import("puppeteer").Configuration}
 */
export default {
  // Changes the cache location for Puppeteer.
  cacheDirectory: join(import.meta.dirname, '.cache', 'puppeteer'),
};