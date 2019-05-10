import { createProxy } from './util/proxy';

export class Module {
    resource: string;
    errors: any[] = [];
    buildMeta: Record<string, any> = {};

    constructor(resource: string) {
        this.resource = resource;
    }
}

export function createModule(resource: string) {
    return createProxy('Module', new Module(resource));
}
