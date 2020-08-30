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
        this.state = rawModule.state;
    }
    getChild(key) {
        return this._children[key];
    }
    addChild(key, module) {
        this._children[key] = module;
    }
	/**
	 * 提供遍历该模块下的Mutation api
	 */
    forEachMutation(fn) {
        if (this._rawModule.mutations) {
            forEachValue(this._rawModule.mutations, fn);
        }
    }
	/**
	 * 提供遍历该模块下的Action api
	 */
    forEachAction(fn) {
        if (this._rawModule.actions) {
            forEachValue(this._rawModule.actions, fn);
        }
    }
	/**
	 * 提供遍历该模块下的Getter api
	 */
    forEachGetter(fn) {
        if (this._rawModule.getters) {
            forEachValue(this._rawModule.getters, fn);
        }
    }
    /**
	 * 提供遍历该模块下的Child api
	 */
    forEachChild(fn) {
        forEachValue(this._children, fn);
    }
    /**
     * 访问该模块化下的namespaced属性
     */
    get namespaced() {
        return !!this._rawModule.namespaced;
    }
}
