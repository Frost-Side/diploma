<script>
import Welcome from "./components/Welcome.vue";
import AppHeader from "./components/AppHeader.vue";
import RegLogin from "./components/RegLogin.vue";
import ReaderPage from "./components/ReaderPage.vue";
import AddBooks from "./components/AddBooks.vue";
import DeleteBooks from "./components/DeleteBooks.vue";
import ReadersManagment from "./components/ReadersManagment.vue";
import ControlPanel from "./components/ControlPanel.vue"
import AskHelp from "./components/AskHelp.vue";
import Forbidden from "./components/Forbidden.vue";
import Deactivated from "./components/Deactivated.vue";
import axios from 'axios';
import { RouterView } from 'vue-router';
import { mapState } from 'vuex';

axios.defaults.baseURL = "http://185.119.56.165:3000"

export default {
    components: {
        Welcome,
        AppHeader,
        RegLogin,
        ReaderPage,
        AddBooks,
        DeleteBooks,
        ReadersManagment,
        ControlPanel,
        AskHelp,
        Forbidden,
        Deactivated
    },
    beforeCreate() {
		this.$store.commit('initialiseStore');
	}
}
</script>

<template>
    <AppHeader></AppHeader>
    <router-view></router-view>
    <AskHelp></AskHelp>
</template>

<style></style>
