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
	</div>
</template>

<script>
export default {
	beforeCreate() {
		// console.log(this.$store);
	},
	mounted() {},
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
