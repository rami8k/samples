<script>
import TheHeader from './components/TheHeader.vue'
import TheFooter from './components/TheFooter.vue'

export default {
  name: 'App',
  components: {
    TheHeader,
    TheFooter
  }
}
</script>

<template>
  <div id="app">
    <TheHeader />
    <div class="main-content">
      <router-view/>
    </div>
    <TheFooter />
  </div>
</template>

<style>
@import './assets/globals.css';
</style>
