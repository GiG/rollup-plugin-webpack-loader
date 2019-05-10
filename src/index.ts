import { Plugin, TransformSourceDescription } from 'rollup';
import * as webpack from 'webpack';

import { createFilter } from 'rollup-pluginutils';
import { runLoaders } from 'loader-runner';
import { readFile, writeFile, ensureDir } from 'fs-extra';
import { dirname, join } from 'path';
import {
    NodeJsInputFileSystem,
    CachedInputFileSystem,
    ResolverFactory
} from 'enhanced-resolve';

import { createCompilation } from './compilation';
import { createCompiler } from './compiler';
import { createModule } from './module';

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

export default function loaderPlugin(
    options: ILoaderPluginOptions,
): Plugin {
    const filter = createFilter(options.include, options.exclude);
    const webpackOptions = options.webpackOptions || {};
    const resolveOptions = webpackOptions.resolve ? webpackOptions.resolve : {};

    // Create the fake compiler and compilation objects just in case the loader
    // utilizes these.
    const compiler = createCompiler(webpackOptions);
    const compilation = createCompilation(compiler);

    // Create a resolver that works exactly like the webpack resolver.
    const resolver: any = ResolverFactory.createResolver({
        // @ts-ignore Types are wrong.
        fileSystem: new CachedInputFileSystem(new NodeJsInputFileSystem(), 4000),
        ...resolveOptions,
    });

    return {
        name: 'loader-plugin',
        outputOptions(outputOptions) {
            compiler._setOutputPath(outputOptions.dir || outputOptions.file);
        },
        resolveId(id: string, importer: string) {
            if (!importer) {
                return;
            }

            return new Promise((resolve, reject) => {
                resolver.resolve({}, dirname(importer), id, {}, (error: any, filePath: string) => {
                    if (!error) {
                        if (!filter(filePath)) {
                            resolve();
                            return;
                        }

                        resolve(filePath);
                        return;
                    }

                    reject(error);
                });
            });
        },
        async load(id: string) {
            if (!id) {
                return null;
            }

            const contents = await readFile(id);
            return contents.toString('utf8');
        },
        transform(code: string, id: string) {
            if (!filter(id)) {
                return;
            }

            const context = {
                _compiler: compiler,
                _compilation: compilation,
                _module: compilation.addModule(createModule(id)).module,
                // Pretend to be webpack to the loader as some loaders are babel plugins too.
                webpack: true,
            };

            return new Promise<TransformSourceDescription|void>((resolve, reject) => {
                runLoaders({
                    loaders: options.use as any,
                    resource: id,
                    context,
                    readResource: (fileName: string, callback) => {
                        if (fileName === id) {
                            callback(null, Buffer.from(code, 'utf8'));
                            return;
                        }

                        callback(new Error('File not found: ' + fileName), null);
                    },
                }, (err, res) => {
                    if (err) {
                        this.error(err);
                        reject(err);
                        return;
                    }

                    if (res.fileDependencies) {
                        res.fileDependencies.map((file) => this.addWatchFile(file));
                    }

                    context._module.errors.forEach((error: any) => {
                        this.warn(error);
                    });

                    if (res.result instanceof Buffer) {
                        resolve({
                            code: res.result.toString('utf8'),
                        });
                    } else if (Array.isArray(res.result) && res.result[0]) {
                        resolve({
                            code: res.result[0]!.toString('utf8'),
                        });
                    } else {
                        resolve();
                    }
                });
            });
        },
        generateBundle() {
            return new Promise((resolve, reject) => {
                compiler.hooks.afterCompile.callAsync(compilation, (error: any) => {
                    if (error) {
                        reject(error);
                        return;
                    }

                    compilation.modules.forEach((innerModule) => {
                        innerModule.errors.forEach((err) => this.error(err));
                    });

                    compilation.errors.forEach((err) => {
                        this.warn(err);
                    });

                    resolve();
                });
            });
        },
        async writeBundle() {
            const assets = compilation._getCompilationAssets();
            const assetWrites = assets.map(async ([fileName, source]) => {
                // Rollup performs some file hashing when emitting file assets...
                // We can just write the file directly to avoid this.
                await ensureDir(dirname(join(compiler.outputPath, fileName)));
                await writeFile(join(compiler.outputPath, fileName), source);
            });

            await Promise.all(assetWrites);
        }
    };
}
