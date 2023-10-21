<template>
  <div class="modal-content-container">
    <h1 v-if="type === 'error'"><SvgError class="modal-icon error"/> Error!</h1>
    <h1 v-if="type === 'success'"><SvgCheckbox class="modal-icon success"/> Success</h1>
    <h1 v-if="type === 'alert'"><SvgAlert class="modal-icon alert"/> Alert!</h1>
    <p class="modal-text">{{ message }}</p>
  </div>
</template>
<script>
  import SvgCheckbox from 'fishtank-icons/checkbox-selected-o_24.svg'
  import SvgError from 'fishtank-icons/bcite-negative_24.svg'
  import SvgAlert from 'fishtank-icons/bcite-caution_24.svg'

  export default {
    props: {
      message: { type: String, required: true },
      type: { type: String, required: true }
    },
    components: {
      SvgCheckbox,
      SvgError,
      SvgAlert
    }
  }
</script>
<style>
h1 {
  text-align: center;
}

.modal-content-container {
  margin: auto;
}

.modal-text {
  text-align: center;
  padding: 10px;
}

.modal-icon {
  width: 50px;
  height: 50px;
  vertical-align: sub;
}

.modal-icon.success{
  fill: green;
}

.modal-icon.error{
  fill: red;
}

.modal-icon.error{
  fill: orange;
}
</style>