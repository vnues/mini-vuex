<template>
	<div id="app">
		宋江的年龄是: {{ this.$store.state.age }}
		<br />
		吴用的年龄是: {{ this.$store.getters.getAge }}
		<br />
		<!-- dispatch对应的action -->
		<button @click="$store.dispatch('changeAge', 3)">过一会增加年龄</button>
		<!-- commit 对应的mutation -->
		<button @click="$store.commit('changeAge', 5)">立即增加年龄</button>
		<button @click="handleClick">点击按钮</button>
	</div>
</template>

<script>
export default {
	beforeCreate() {
		// console.log(this.$store);
	},
	mounted() {},
	methods: {
		handleClick() {
			/**
			 * 这种写法错误但是没有进行对于这种形式没有进行拦截处理
			 * 其实mutation也是这样做
			 *  changeAge(state, payload) {
			 *  state.age += payload
			 * }
			 * mutation最终还是走了赋值（setter）这步state.age += payload
			 * 可以通过一个_committing标识变量进行拦截
			 */

			/**
			 * strict:
			 * 使 Vuex store 进入严格模式，在严格模式下，任何 mutation 处理函数以外修改 Vuex state 都会抛出错误。
			 */
			this.$store.state.age = this.$store.state.age + 1;
		},
	},
	name: "App",
};
</script>

<style>
#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
	margin-top: 60px;
}
</style>
