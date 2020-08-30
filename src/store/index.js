/**
 * 因为es模块是静态的 而且是值的引用
 * 所以项目的Vue构造函数跟这里的是同一个
 */
import Vue from 'vue'
import Vuex from '../vuex'
Vue.use(Vuex)

function persists(store) {
    console.log('store', store)
    let local = localStorage.getItem('VUEX:state');
    if (local) {
        store.replaceState(JSON.parse(local)); // 会用local替换掉所有的状态
    }
    store.subscribe((mutation, state) => {
        // 这里需要做一个节流  throttle lodash
        localStorage.setItem('VUEX:state', JSON.stringify(state));
    });
}

export default new Vuex.Store({
    plugins: [persists],
    state: {
        age: 0
    },
    getters: {
        getAge(state) {
            return state.age + 10;
        }
    },
    mutations: {
        changeAge(state, payload) {
            state.age += payload
        }
    },
    actions: {
        changeAge({
            commit
        }, payload) {
            setTimeout(() => {
                commit('changeAge', payload);
            }, 1000);
        }
    },
    modules: {
        a: {
            namespaced: true,
            state: {
                age: 188
            },
            getters: {
                getAmoduleAge(state) {
                    return state.age + 100;
                }
            },
            mutations: {
                changeAmoduleAge(state, payload) {
                    state.age += payload
                },
                changeAge(state, payload) {
                    state.age += payload
                }
            },
            actions: {
                changeAge({
                    commit
                }, payload) {
                    setTimeout(() => {
                        commit('changeAge', payload);
                    }, 1000);
                }
            },
            modules: {
                c: {
                    namespaced: true,
                    state: {
                        height: 188
                    },
                }
            }
        },
        b: {
            namespaced: true,
            state: {
                age: 188
            },
            getters: {
                getBmoduleAge(state) {
                    return state.age + 100;
                }
            },
        }

    }
})