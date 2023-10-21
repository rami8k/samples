<template>
  <form id="login-form" class="sign-in-containter" @keyup="validate" @change="validate">
    <div v-if="errors.length">
      <p v-for="error in errors" :key="error" class="error">
        {{ error }}
      </p>
    </div>
    <div><input type="email" v-model="email" name="email" placeholder="Your email address" required></div>
    <div><input type="password" v-model="password" name="password" placeholder="Your password" required></div>
    <div><input type="button" class="action-button" value="Login" @click="login" :disabled="!isValid || loading === 1"></div>
    <h4 v-if="loading">Loading...</h4>
  </form>
</template>

<script>
import { SIGNIN_USER_MUTATION } from "../api/graphql/authentication"

import auth from '../api/auth'
import { graphQLErrorMessages } from '../api/graphqlError'

export default {
  name: 'Login',
  data() {
    return {
      email: '',
      password: '',
      loading: 0,
      isValid: false,
      errors: []
    }
  },
  watch: {
    loading: function (val) {
      console.log(val)
    }
  },
  methods: {
    validate() {
      this.isValid = this.$el.checkValidity()
    },
    login() {
      this.$apollo.mutate({
        mutation: SIGNIN_USER_MUTATION,
        variables: {
          email: this.email,
          password: this.password
        }
      }).then((result) => {
        auth.user = result.data.login
        auth.user.roles.includes('admin') ? window.location = '/admin' : window.location = '/'
      }).catch((error) => {
        this.errors = graphQLErrorMessages(error)
      })
    }
  }
}
</script>

<style>
.sign-in-containter {
  min-height: 600px;
}

.sign-in-containter div {
  padding: 10px;
}

.sign-in-containter input {
  width: 250px;
}

.sign-in-containter input[type="button"] {
  width: 150px;
}
</style>