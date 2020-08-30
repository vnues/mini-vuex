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
			 * 所以好像对于这种情况拦截不了吧 不然你就会拦截到mutation里的 因为mutation最终还是走了赋值（setter）这步state.age += payload
			 * 我们开发时候默认遵守规范就好
			 * 之所以用mutation这种形式 是为了方便跟踪数据流 单向的
			 * 如果都是this.$store.state.age = this.$store.state.age + 1这种
			 * 一个变量被多处修改 完全追踪不到
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
