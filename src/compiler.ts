import { createProxy } from './util/proxy';
import { AsyncSeriesHook } from 'tapable';
import webpack = require('webpack');

const something: webpack.compilation.Compilation = '' as any;
export class Compiler {
    hooks = createProxy('Hooks', {
        /** @type {AsyncSeriesHook<Compilation>} */
        afterCompile: new AsyncSeriesHook(['compilation']),

        // TODO: If possible implement more of the following.
        // /** @type {SyncBailHook<Compilation>} */
        // shouldEmit: new SyncBailHook(['compilation']),
        // /** @type {AsyncSeriesHook<Stats>} */
        // done: new AsyncSeriesHook(['stats']),
        // /** @type {AsyncSeriesHook<>} */
        // additionalPass: new AsyncSeriesHook([]),
        // /** @type {AsyncSeriesHook<Compiler>} */
        // beforeRun: new AsyncSeriesHook(['compiler']),
        // /** @type {AsyncSeriesHook<Compiler>} */
        // run: new AsyncSeriesHook(['compiler']),
        // /** @type {AsyncSeriesHook<Compilation>} */
        // emit: new AsyncSeriesHook(['compilation']),
        // /** @type {AsyncSeriesHook<Compilation>} */
        // afterEmit: new AsyncSeriesHook(['compilation']),

        // /** @type {SyncHook<Compilation, CompilationParams>} */
        // thisCompilation: new SyncHook(['compilation', 'params']),
        // /** @type {SyncHook<Compilation, CompilationParams>} */
        // compilation: new SyncHook(['compilation', 'params']),
        // /** @type {SyncHook<NormalModuleFactory>} */
        // normalModuleFactory: new SyncHook(['normalModuleFactory']),
        // /** @type {SyncHook<ContextModuleFactory>}  */
        // contextModuleFactory: new SyncHook(['contextModulefactory']),

        // /** @type {AsyncSeriesHook<CompilationParams>} */
        // beforeCompile: new AsyncSeriesHook(['params']),
        // /** @type {SyncHook<CompilationParams>} */
        // compile: new SyncHook(['params']),
        // /** @type {AsyncParallelHook<Compilation>} */
        // make: new AsyncParallelHook(['compilation']),

        /** @type {AsyncSeriesHook<Compiler>} */
        watchRun: new AsyncSeriesHook(['compiler']),
        // /** @type {SyncHook<Error>} */
        // failed: new SyncHook(['error']),
        // /** @type {SyncHook<string, string>} */
        // invalid: new SyncHook(['filename', 'changeTime']),
        // /** @type {SyncHook} */
        // watchClose: new SyncHook([]),
    });

    options: webpack.Configuration;
    context: webpack.Configuration['context'];
    outputPath: string = '';

    constructor(webpackOptions?: webpack.Configuration) {
        this.options = createProxy('WebpackOptions', webpackOptions || {});
        this.context = webpackOptions ? webpackOptions.context : process.cwd();
    }

    isChild() {
        return false;
    }

    _setOutputPath(path: string | undefined) {
        this.outputPath = path || '';
    }
}

export function createCompiler(webpackOptions?: webpack.Configuration) {
    return createProxy('Compiler', new Compiler(webpackOptions));
}
