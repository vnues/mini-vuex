export const mapState = arrList => {
    let obj = {};
    for (let i = 0; i < arrList.length; i++) {
        let stateName = arrList[i];
        obj[stateName] = function () {
            return this.$store.state[stateName];
        };
    }
    return obj;
};



export const mapMutations = mutationList => {
    let obj = {};
    for (let i = 0; i < mutationList.length; i++) {
        let type = mutationList[i]
        obj[type] = function (payload) {
            this.$store.commit(type, payload);
        }
    }
    return obj
}


export const mapActions = actionList => {
    let obj = {};
    for (let i = 0; i < actionList.length; i++) {
        let type = actionList[i]
        obj[type] = function (payload) {
            this.$store.dispatch(type, payload);
        }
    }
    return obj
}

export const mapGetters = arrList => {
    let obj = {};
    for (let i = 0; i < arrList.length; i++) {
        let getterName = arrList[i]
        obj[getterName] = function () {
            return this.$store.getters[getterName];
        };
    }
    return obj;
}; 