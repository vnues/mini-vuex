/**
 * 这个Vue是用户传入的Vue
 * 不是我们单独引入的 import Vue from 'vue'
 * 所以插件拿到的Vue跟项目中的构造函数Vue是同一个
 */

function applyMixin(Vue) {
    Vue.mixin({
        /**
         * 全局配置 [全局的mixin生命周期,组件的生命周期]
         * 所以组件生命周期是可以拿到this.$store
         * 为什么在beforeCreate调用
         * 因为我们想让组件beforeCreate生命周期也能拿到this.$store
         * 在这里配置是最好的时机
         */
        beforeCreate: vuexInit
    })
}

/**
 * 挂载$store到实例vm上
 */
function vuexInit() {
    const options = this.$options
    /**
     * 挂载到根实例
     * 根实例是指
     * const vm=new Vue({
     * store,
     * render: h => h(App),
     * }).$mount('#app')
     * vm就是根实例
     * 不要认为是app.vue
     */
    if (options.store) {
        this.$store = options.store
    } else if (options.parent && options.parent.$store) {
        /**
         * 挂载到组件实例
         */
        this.$store = options.parent.$store
    }
}


export default applyMixin