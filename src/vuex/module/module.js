import { forEachValue } from "../util";

/**
 * 抽离模块类
 */
export default class Module {
    constructor(rawModule) {
        /**
         * 父级模块
         */
        this._rawModule = rawModule;
        /**
         * 子模块
         */
        this._children = {};
        this.state = rawModule.state
    }
    getChild(key) {
        return this._children[key]
    }
    addChild(key, module) {
        this._children[key] = module
    }
    forEachMutation(fn) {
        if (this._rawModule.mutations) {
            forEachValue(this._rawModule.mutations, fn)
        }
    }
    forEachAction(fn) {
        if (this._rawModule.actions) {
            forEachValue(this._rawModule.actions, fn)
        }
    }
    forEachGetter(fn) {
        if (this._rawModule.getters) {
            forEachValue(this._rawModule.getters, fn)
        }
    }
    forEachChild(fn) {
        forEachValue(this._children, fn);
    }
}