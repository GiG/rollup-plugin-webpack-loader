import { createProxy } from './util/proxy';
import { Compiler } from './compiler';
import { Module } from './module';

export class Compilation {
    compiler: Compiler;
    errors: any[] = [];
    modules: Module[] = [];
    assets: Record<string, { source: () => string, size: () => number }> = {};

    constructor(compiler: Compiler) {
        this.compiler = compiler;
    }

    addModule(module: Module) {
        this.modules.push(module);
        return createProxy('Compilation#addModule', {
            module,
        });
    }

    _getCompilationAssets() {
        return Object.entries(this.assets).map(([ filePath, asset ]) => {
            return [ filePath, asset.source() ];
        });
    }
}

export function createCompilation(compiler: Compiler) {
    return createProxy('Compilation', new Compilation(compiler));
}
