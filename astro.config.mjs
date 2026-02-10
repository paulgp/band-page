import { defineConfig } from 'astro/config';
import yaml from '@rollup/plugin-yaml';

export default defineConfig({
  site: 'https://paulgp.github.io',
  base: '/band-page',
  vite: {
    plugins: [yaml()]
  }
});
