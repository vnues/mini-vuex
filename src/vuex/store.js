import ModuleCollection from './module/module-collection'
import applyMixin from './mixin'
import { forEachValue } from './util';

/**
 * 声明全局的Vue方便获取
 */
let Vue

/**
 * modules: {
    a: {
        state: {
            age: 188
        }
 * } 
 * 这里的意思是 store下有个子模块 这个子模块就是a store
 * 注意我们是这样获取vuex状态的
 * this.$store.a.age
 * 并不是this.$store.a.state.age
 * 是以模块的方式获取而不是对象的层级
 */

/**
 * 将模块里的属性绑定给store
 * 在绑定属性是增加命名空间即可
 */
function installModule(store, rootState, path, module) {
    let namespace = store._modules.getNamespace(path);
    console.log('namespace', namespace)
    if (path.length > 0) {
        let parent = path.slice(0, -1).reduce((memo, current) => {
            return memo[current];
        }, rootState);
        /**
         * 添加或者修改属性
         * 将state下的属性设置成响应式数据
         */
        Vue.set(parent, path[path.length - 1], module.state);
    }
    module.forEachMutation((mutation, key) => {
        store._mutations[namespace + key] = (store._mutations[namespace + key] || []);
        store._mutations[namespace + key].push((payload) => {
            mutation.call(store, module.state, payload);
        });
    });
    module.forEachAction((action, key) => {
        store._actions[namespace + key] = (store._actions[namespace + key] || []);
        store._actions[namespace + key].push(function (payload) {
            action.call(store, this, payload);
        });
    });
    module.forEachGetter((getter, key) => {
        store._wrappedGetters[namespace + key] = function () {
            return getter(module.state);
        }
    });
    /**
     * forEach自带终止条件
     * 如果数组为空是不会进行遍历
     * 这样递归的终止条件就有了
     */
    module.forEachChild((child, key) => {
        installModule(store, rootState, path.concat(key), child)
    })
}

/**
 * 定义状态和计算属性Getters
 * 获取get是 state和getters
 * 设置set 是mutaions和actions
 */
function resetStoreVM(store, state) {
    const computed = {};
    store.getters = {};
    const wrappedGetters = store._wrappedGetters
    forEachValue(wrappedGetters, (fn, key) => {
        computed[key] = () => {
            return fn(store.state);
        }
        /**
         * 对计算属性Getters进行代理
         */
        Object.defineProperty(store.getters, key, {
            get: () => store._vm[key]
        })
    });
    /**
     * 如果属性是以$开头
     * vue内部是不会帮你代理到实例上的
     * 比如以vm.$state这样访问
     * 这样可以优化性能
     * 并不是全部的属性都要代理到实例上的
     */
    /**
     * 实际通过Vue.observable( object ) 让一个对象可响应。Vue 内部会用它来处理 data 函数返回的对象。也行
     * 用new Vue由于我们没有传template render它不会自己渲染出视图
     * 但是要getters计算属性
     * 所以直接通过new Vue也行
     * 这里new Vue()的作用转化数据变成响应式数据
     * 一旦你在项目中使用到vuex的state
     * state里的属性就会自己收集依赖触发更新
     */
    store._vm = new Vue({
        data: {
            $$state: state,
        },
        computed
    });
}

export class Store {
    constructor(options) {
        /**
         * 收集模块转化成一棵树
         */
        this._modules = new ModuleCollection(options)
        /**
         * 根状态
         */
        let state = this._modules.root.state
        /**
         * 使用vuex时，用户是定义好actions,mutations,getters
         * 并不需要获取，而state是需要获取
         * 所以内部类中得初始化一个state给它 vm.$store.state
         */
        this._actions = {};
        this._mutations = {};
        this._wrappedGetters = {}
        /**
         *  安装模块
         *  从根模块开始安装
         */
        installModule(this, state, [], this._modules.root);
        resetStoreVM(this, state);
    }
    commit = (type, payload) => {
        this._mutations[type].forEach(fn => fn.call(this, payload));
    }
    dispatch = (type, payload) => {
        this._actions[type].forEach(fn => fn.call(this, payload));
    }
    /**
     * 当我们获取state
     * vm.$store.state
     */
    get state() {
        return this._vm._data.$$state
    }
}

export const install = function (_Vue) {
    Vue = _Vue
    applyMixin(Vue)
}

