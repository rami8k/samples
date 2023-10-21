<template>
  <div class="banner">
    <router-link :to="headerRoute"><img style="padding-top: 15px;" src="../assets/images/logo.png" alt="logo"></router-link>
    <span class="header">Compliance Tool</span>
    <div v-if="isLoggedIn" class="user-info">
      <a href="#" class="user-settings"><SvgGear class="icon"/>Settings</a><a href="#" class="user-name"><SvgUser class="icon"/>{{ userFirstName }}</a><a href="#" @click="logout" class="logout"><SvgLogout class="icon"/>Logout</a>
    </div>
  </div>
</template>

<script>

import auth from '../api/auth'

import SvgUser from 'fishtank-icons/user_32.svg'
import SvgGear from 'fishtank-icons/gear_32.svg'
import SvgLogout from 'fishtank-icons/logout_32.svg'


export default {
  methods: {
    logout() {
      auth.logout()
      window.location = '/login'
    }
  },
  computed: {
    isLoggedIn: () => {
      return auth.isLoggedIn()
    },
    userFirstName: () => {
      return auth.isLoggedIn() ? auth.user.firstName : ''
    },
    headerRoute: () => {
      return auth.isAdmin() ? { name: 'admin'} : { name: 'home'}
    }
  },
  components: {
    SvgUser,
    SvgGear,
    SvgLogout
  }
}
</script>

<style>

.banner {
  height: 77px;
  background-image: url(../assets/images/banner-bg.png);
  background-size: cover;
}

.banner .header {
  color: white;
}

.banner .user-info {
  color: white;
  position: absolute;
  top: 0;
  right: 0;
  padding: 5px
}

.user-info a {
  color: white;
  padding-left: 10px;
}
</style>