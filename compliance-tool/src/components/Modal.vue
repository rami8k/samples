<template>
  <div class="modal-mask" v-if="showModal" @click="close" :width="400" :height="showActions ? 400 : 200">
    <div class="modal-wrapper">
      <div class="modal-content-container">
        <h3 v-if="type === 'error'"><SvgError class="modal-icon error"/> Error!</h3>
        <h3 v-if="type === 'success'"><SvgCheckbox class="modal-icon success"/> Success</h3>
        <h3 v-if="type === 'alert'"><SvgAlert class="modal-icon alert"/> Alert!</h3>
        <p class="modal-text">{{ message }}</p>
        <div v-if="showActions" class="modal-actions">
          <button class="action-button modal-button" @click="ok()">Ok</button>
          <button class="action-button modal-button" @click="close()">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import SvgCheckbox from 'fishtank-icons/checkbox-selected-o_24.svg'
  import SvgError from 'fishtank-icons/bcite-negative_24.svg'
  import SvgAlert from 'fishtank-icons/bcite-caution_24.svg'

  export default {
    data () {
      return {
        showModal: false,
        message: '',
        type: '',
        showActions: false,
        onOk: null,
        onClose: null
      }
    },
    mounted: function () {
      document.addEventListener("keydown", (e) => {
        if (this.show && e.keyCode === 27) {
          this.close()
        }
      })
    },
    methods: {
      close: function () {
        this.showActions = false
        this.showModal = false
        if(this.onClose) {
          this.onClose()
        }
      },
      ok: function() {
        this.close()

        if(this.onOk) {
          this.onOk()
        }
      },
      showMessage: function (params) {
        this.showActions = false
        this.type = params.type
        this.message = params.message

        this.showModal = true
      },
      showDialog: function (params) {
        this.showActions = true
        this.type = params.type
        this.message = params.message
        this.onOk = params.onOk
        this.onClose = params.onClose

        this.showModal = true
      }
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

.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, .5);
  display: table;
  transition: opacity .3s ease;
}

.modal-wrapper {
  display: table-cell;
    vertical-align: middle;
}

.modal-content-container {
  margin: auto;
  width: 300px;
  vertical-align: middle;
  padding: 10px 0px 20px 0px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
  transition: all .3s ease;
  font-family: Helvetica, Arial, sans-serif;
}

.modal-text {
  text-align: center;
}

.modal-icon {
  width: 30px;
  height: 30px;
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

.modal-actions {
  text-align: center;
}

.modal-button {
  width: 100px;
}
</style>