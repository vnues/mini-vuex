/**
 * 因为es模块是静态的 而且是值的引用
 * 所以项目的Vue构造函数跟这里的是同一个
 */
import Vue from 'vue'
import Vuex from '../vuex'
Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        age: 28
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