import { Store, install } from './store';
import { mapState, mapMutations, mapGetters, mapActions, createNamespacedHelpers } from './helpers'

/**
 * vuex就是一个vue插件
 * 导出的对象要求提供一个install方法
 */
export default {
    Store,
    install,
    mapState,
    mapMutations,
    mapGetters,
    mapActions,
}