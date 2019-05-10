export function createProxy<T extends object>(name: string, proxyTarget: T): T {
    return new Proxy(proxyTarget, {
        get(target: any, symbol) {
            if (symbol in target) {
                return target[symbol];
            }

            throw new Error(`Property or method '${String(symbol)}' on '${name}' has not yet been implemented.`);
        },
        set(target: any, symbol, value) {
            if (symbol in target) {
                return target[symbol] = value;
            }

            throw new Error(`Cannot set property '${String(symbol)}' on '${name}' as it is not yet implemented`);
        },
    });
}
