<script>
import { store } from '../main.js'
</script>

<template>
  <header class="site-header">
    <nav class="navbar navbar-expand-lg bg-body-tertiary bg-dark" data-bs-theme="dark">
      <div class="container" v-if="$store.state.isAuthenticated">
        <router-link class="navbar-brand p-0 d-flex align-items-center" to="/">
          <img src="/src/assets/logo.svg" alt="Logo" width="100" class="d-inline-block align-text-center">
        </router-link>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item" v-if="($store.state.userRole === 'librarian' || $store.state.userRole === 'admin') && $store.state.userStatus === 'active'">
              <router-link class="nav-link" to="/control-panel" activeClass="active">Панель управления библиотекаря</router-link>
            </li>
            <li class="nav-item" v-if=" $store.state.userStatus === 'active'">
              <router-link class="nav-link" to="/reader-page" activeClass="active">Страница читателя</router-link>
            </li>
          </ul>
          <button class="btn btn-outline-danger" type="button" @click="$router.push('/logout')">Выход</button>
        </div>
      </div>
      <div class="container" v-else>
        <router-link class="navbar-brand d-flex align-items-center" to="/">
          <img src="/src/assets/logo.svg" alt="Logo" width="100" class="d-inline-block align-text-center">
        </router-link>
      </div>
    </nav>
  </header>
</template>