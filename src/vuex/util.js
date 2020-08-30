export function forEachValue(obj, fn) {
    Object.keys(obj).forEach(key => fn(obj[key], key))
}

export function assert(condition, msg) {
    if (!condition) throw new Error(`[vuex] ${msg}`)
}