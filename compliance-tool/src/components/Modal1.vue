<template>
  <div>
    <modals-container name="modal-message"/>
    <v-dialog name="modal-dialog"/>
  </div>
</template>
<script>
  import ModalMessage from './ModalMessage.vue'

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
        this.$modal.show(ModalMessage, {
          message: params.message,
          type: params.type
        },{
          width: 400,
          height: 200
        })
      },
      showDialog: function(params) {
        this.showActions = true
        this.$modal.show('dialog', {
          title: 'Alert!',
          text: params.message,
          buttons: [
            {
              title: 'Ok',
              handler: () => { 
                this.$modal.hide('dialog'); 
                params.onOk() 
              }
            },
            {
              title: 'Close'
            }
        ]
        })
      }
    },
    components: {
      ModalMessage
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

.modal-actions {
  text-align: center;
}
</style>