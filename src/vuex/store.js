import ModuleCollection from "./module/module-collection";
import applyMixin from "./mixin";
import { forEachValue, assert } from "./util";
import store from "../store";

/**
 * 声明全局的Vue方便获取
 */
let Vue;

/**
 * 根据path拿到其模块化下的state
 */
function getState(store, path) {
	/**
	 * 没问题store.state这样写
	 * 因为实际是走这个方法的get state(){}
	 */
    return path.reduce((newState, current) => newState[current], store.state);
}

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
 * installModule:
 * 一.将模块里的属性state、getters、mutations、actions绑定给store
 * 二.在绑定属性是增加命名空间即可
 */
function installModule(store, rootState, path, module) {
	/**
	 * 每个模块都绑定了一个属于自己的path变量（不是共用的）
	 * path是用来记录递归模块的关系
	 * 比如[a,b,c]===>表示b是c的爸爸 a是b的爸爸
	 * 有了path这样实现命名空间也很简单
	 * ❗️path为空表示根模块
	 */
    let namespace = store._modules.getNamespace(path);
    if (path.length > 0) {
        let parent = path.slice(0, -1).reduce((memo, current) => {
            return memo[current];
        }, rootState);

		/**
		 * 添加或者修改属性
		 * 将state下的属性设置成响应式数据
		 * 这里必须在module.state下拿值
		 * 因为是初始值
		 * 直接通过store.state是拿不到 因为此时还没有new Vue
		 * mutation actions都是在函数内 执行才获取值 等到他们执行的时候早就初始化完成了
		 */
        store._withCommitting(() => {
            /**
             * 为什么使用Vue.set是因为触发mutaion的时候可能新增值
             */
            Vue.set(parent, path[path.length - 1], module.state);
        })
    }
    module.forEachMutation((mutation, key) => {
        store._mutations[namespace + key] = store._mutations[namespace + key] || [];
        store._mutations[namespace + key].push((payload) => {
			/**
			 * 如果使用module.state涉及到作用域的问题
			 * 因为relaceState会把整个state覆盖 也就是指针改变了
			 * 实际我们应该拿store下的模块state才是最安全的 ✅统一都去store.state拿
			 */
            store._withCommitting(() => {
                mutation.call(store, getState(store, path), payload);
				/**
				 *  store._subscribers.forEach((sub) => sub({ mutation, key }, store.state))
				 * 应该放到外层去 插件可能不会走commit形式
				 */
            });
			/**
			 * 把最新的整个state传递过去
			 */
            store._subscribers.forEach((sub) => sub({ mutation, key }, store.state));
        });
    });
    module.forEachAction((action, key) => {
        store._actions[namespace + key] = store._actions[namespace + key] || [];
        store._actions[namespace + key].push(function (payload) {
            action.call(store, this, payload);
            store._subscribers.forEach((sub) => sub({ action, key }, store.state));
        });
    });
    module.forEachGetter((getter, key) => {
        store._wrappedGetters[namespace + key] = function () {
            return getter(getState(store, path));
        };
    });
	/**
	 * 遍历这颗module树是深度优先
	 * forEach自带终止条件
	 * 如果数组为空是不会进行遍历
	 * 这样递归的终止条件就有了
	 */
    module.forEachChild((child, key) => {
		/**
		 *  concat() 方法用于合并两个或多个数组。此方法不会更改现有数组，而是返回一个新数组。
		 */
        installModule(store, rootState, path.concat(key), child);
    });
}

/**
 * 定义状态和计算属性Getters
 * 获取get是 state和getters
 * 设置set 是mutaions和actions
 */
function resetStoreVM(store, state) {
    let oldVm = store._vm;
    const computed = {};
    store.getters = {};
    const wrappedGetters = store._wrappedGetters;
    forEachValue(wrappedGetters, (fn, key) => {
        computed[key] = () => {
            return fn(store.state);
        };
		/**
		 * 对计算属性Getters进行代理
		 */
        Object.defineProperty(store.getters, key, {
            get: () => store._vm[key],
        });
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
        computed,
    });
	/**
	 * 销毁实例
	 * store._vm = new Vue只是将指针指向别的Vue实例而已
	 */
    if (oldVm) {
        Vue.nextTick(() => oldVm.$destroy());
    }
    if (store.strict) {
        /**
         * ❗️注意$开头不会进行代理
         */
        /**
         * 只能写成函数形式 因为'store._vm._data.$$state'
         * 会认为是this.store._vm._data.$$state this指的是store._vm指向的实例就是vm了
         */
        store._vm.$watch(() => store._vm._data.$$state, () => {
            assert(store._committing, "在mutation之外更改了状态");
        }, { deep: true, sync: true });
    }
}

export class Store {
    constructor(options) {
		/**
		 * 收集模块转化成一棵树
		 * this._modules表示一颗模块树
		 */
        this._modules = new ModuleCollection(options);
        console.log("this._modules", this._modules);
		/**
		 * 根状态
		 */
        const state = this._modules.root.state;
		/**
		 * 使用vuex时，用户是定义好actions,mutations,getters
		 * 并不需要获取，而state是需要获取
		 * 所以内部类中得初始化一个state给它 vm.$store.state
		 */
        this._actions = {};
        this._mutations = {};
        this._wrappedGetters = {};
        this._subscribers = [];
		/**
		 * 拦截commit操作的标识符
		 */
        this._committing = false;
        this.strict = options.strict
		/**
		 * 注意顺序：
		 * 先按照模块拿到整体的state 再把state变成响应式对象
		 * 然后插件拿到的肯定是响应式数据(不然通过$store.state.xx是访问不到的) 所以顺序是
		 * installModule===>resetStoreVM===>执行plugins
		 */
        installModule(this, state, [], this._modules.root);

		/**
		 *  安装模块
		 *  从根模块开始安装
		 */
        resetStoreVM(this, state);
        if (Array.isArray(options.plugins)) {
            options.plugins.forEach((plugin) => plugin(this));
        }
    }
	/**
	 * 当我们获取state
	 * vm.$store.state
	 */
    get state() {
        return this._vm._data.$$state;
    }
    set state(v) {
        assert(false, `use store.replaceState() to explicit replace store state.`);
    }
    /**
     * commit实际就是触发一个mutation执行
     */
    commit = (type, payload) => {
        this._mutations[type].forEach((fn) => fn.call(this, payload));
    };
    dispatch = (type, payload) => {
        this._actions[type].forEach((fn) => fn.call(this, payload));
    };
	/**
	 * 模块动态注册:
	 * 注册模块 `myModule`
	 * store.registerModule('myModule', { ...})
	 * 注册嵌套模块 `nested/myModule`
	 * store.registerModule(['nested', 'myModule'], {})
	 */
    registerModule(path, rawModule) {
        if (typeof path === "string") {
            path = [path];
        }
		/**
		 * 往这课模块树添加模块节点
		 * 内部会格式化这个节点
		 */
        this._modules.register(path, rowModule);
		/**
		 * 安装模块
		 */
        installModule(this, this.state, path, rawModule.rawModule);
        resetStoreVM(this, this.state);
    }
	/**
	 * 订阅状态变化事件
	 */
    subscribe(fn) {
        this._subscribers.push(fn);
    }
	/**
	 * 更新状态state
	 * 注意是更新整个state
	 * 而不是单个
	 * state是一个对象 跟module树区分开来 不是同个东西
	 */
    replaceState(state) {
		/**
		 * Vue内部会将覆盖的数据转化成响应式的
		 */
        this._withCommitting(() => {
            this._vm._data.$$state = state;
        })
    }
    _withCommitting(fn) {
		/**
		 * 利用了js单线程的特点
		 */
        const committing = this._committing;
        this._committing = true;
        fn();
        this._committing = committing;
    }
}

export const install = function (_Vue) {
    Vue = _Vue;
    applyMixin(Vue);
};
