module.exports = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  viteFinal: async (config) => {
    config.assetsInclude = config.assetsInclude || [];
    config.assetsInclude.push('**/*.md');

    // Configure esbuild to handle TypeScript properly
    config.esbuild = {
      target: 'es2020',
      loader: 'tsx',
      include: /src\/.*\.[jt]sx?$/,
    };

    config.optimizeDeps = config.optimizeDeps || {};
    config.optimizeDeps.esbuildOptions = {
      target: 'es2020',
      loader: {
        '.ts': 'tsx',
        '.tsx': 'tsx',
      },
    };

    return config;
  },
};
