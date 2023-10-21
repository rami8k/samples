<template>
  <div class="modal-test">
    <modal name="modal-message" :width="400" :height="200">
      <div class="modal-content-container">
        <h1 v-if="type === 'error'"><SvgError class="modal-icon error"/> Error!</h1>
        <h1 v-if="type === 'success'"><SvgCheckbox class="modal-icon success"/> Success</h1>
        <h1 v-if="type === 'alert'"><SvgAlert class="modal-icon alert"/> Alert!</h1>
        <p class="modal-text">{{ message }}</p>
        <div v-if="showActions" class="modal-actions">
          <button class="action-button modal-button" @click="$emit('modalOk');$modal.hide('modal-message')">Ok</button>
          <button class="action-button modal-button" @click="$emit('modalCancel');$modal.hide('modal-message')">Cancel</button>
        </div>
      </div>
    </modal>
    <v-dialog/>
  </div>
</template>
<script>
  import SvgCheckbox from 'fishtank-icons/checkbox-selected-o_24.svg'
  import SvgError from 'fishtank-icons/bcite-negative_24.svg'
  import SvgAlert from 'fishtank-icons/bcite-caution_24.svg'

  export default {
    data () {
      return {
        message: '',
        type: '',
        showActions: false
      }
    },
    methods: {
      showMessage: function (params) {
        this.showActions = params.showActions
        this.type = params.type
        this.message = params.message
        this.$modal.show('modal-message')
      },
      showDialog: function(params) {
        this.showActions = true
        this.$modal.show('dialog', {
          title: 'Alert!',
          text: 'You are too awesome',
          buttons: [
            {
              title: 'Deal with it',
              handler: () => { params.onOk() }
            },
            {
              title: '',       // Button title
              default: true,    // Will be triggered by default if 'Enter' pressed.
              handler: () => {} // Button click handler
            },
            {
              title: 'Close'
            }
        ]
        })
      },
      showDialog1: function(params) {
        this.$modal.show('dialog', {
          title: 'Alert!',
          text: 'You are too awesome',
          buttons: [
            {
              title: 'Deal with it',
              handler: () => { alert('Woot!') }
            },
            {
              title: '',       // Button title
              default: true,    // Will be triggered by default if 'Enter' pressed.
              handler: () => {} // Button click handler
            },
            {
              title: 'Close'
            }
        ]
        })
      }
    },
    mounted: function () {
      // this.bus.$on('SHOW_MODAL_MESSAGE', (params) => {
      //   console.log('SHOW_MODAL_MESSAGE')

      //   this.type = params.type
      //   this.message = params.message
      //   this.$modal.show('modal-message')
      // })
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

.modal-actions {
  text-align: center;
}

.modal-button {
  width: 100px;
}
</style>