# Webpack Loader Rollup Plugin

Allows the use of Webpack loaders as if they were actual rollup plugins. This plugin does not simply run a webpack instance, it'l run the loader exactly how webpack does it (using the `loader-runner` library from WebPack itself.).

## Caveats

Currently it works with all the first party loaders and `ts-loader`, other loaders may work fine but untested. Webpack allows loaders hacky access (literally states this in their documentation) to the webpack compiler, because of this the plugin implements a very small subset of that API.

Best bet is to try it out with your loader and if you see an error that a method has not been implemented yet, file an issue.

## Installation

```bash
npm i --save-dev @betit/rollup-plugin-webpack-loader
```

## Usage

As an example, heres how we can use the typescript loader with this plugin, you may want to check out `@betit/rollup-plugin-rename-extensions` in order to rename `.ts` to `.js` when using preserve modules.

Note how we can pass through webpack options, this is because some loaders want access to webpack options, if a loader requires this though, at build time this plugin will tell you what option is missing so you can fix it.

```js
import loaderPlugin from '@betit/rollup-plugin-webpack-loader';

// Rollup Configuration
export default {
    input: './src/index.ts',
    /* ... */
    plugins: [
        // ...
        loaderPlugin({
            include: /\.ts$/,
            exclude: /\.d\.ts$/,
            use: [
                {
                    loader: 'ts-loader',
                }
            ],
            webpackOptions:  {
                resolve: {
                    symlinks: true,
                    extensions: ['.tsx', '.ts', '.js'],
                },
            },
        }),
    ],
},
```

## Options

```typescript
export interface ILoaderPluginOptions {
    /**
     * Files to match for running through the specified loaders.
     */
    include: Array<string | RegExp> | string | RegExp | null;

    /**
     * Files to explicitly exclude from running through the
     * loaders.
     */
    exclude?: Array<string | RegExp> | string | RegExp | null;

    /**
     * Webpack rule set, can be an array of rules.
     */
    use: webpack.RuleSetUse;

    /**
     * Webpack options in case the loader needs it. Resolve
     * configuration is used from this too. Eg. tell the
     * resolver to load 'ts' files etc.
     */
    webpackOptions?: Partial<webpack.Configuration>;
}
```