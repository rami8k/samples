<template>
  <div>
    <div class="actions-container">
      <button class="action-button" @click="save()"><SvgSave class="icon"/> Save</button>
    </div>
    <div class="table-container">
      <datatable :source="controlsInPlace" :line-numbers="true" class="data-table" :filterable="true" :filter-position="'top'">
        <datatable-column id="id" label="Id" width="5%" :sortable="false" :groupable="false" />
        <datatable-column id="name" label="Name" :sortable="false" :groupable="false" />
        <template slot="name" slot-scope="cell">
          <input type="text" class="edit-box" v-model="cell.row.name" @change="onItemEdit('name', $event.target.value, cell.row.id)">
        </template>
      </datatable>
    </div>
    <ModalMessage ref="modalMessage"/>
  </div>
</template>

<script>
import { GET_CONTROLS_IN_PLACE, UPDATE_CONTROLS_IN_PLACE } from "../../api/graphql/controlsInPlace";

import { editItem } from '../../helpers/editItem'

import ModalMessage from '../../components/ModalMessage'
import SvgSave from 'fishtank-icons/save_32.svg'

export default {
  methods: {
    saveWorkspace() {
      this.$apollo.mutate({
        mutation: UPDATE_CONTROLS_IN_PLACE,
        variables: {
          updatedControlsInPlace: this.editedControlsInPlace
        }
      }).then(async (data) => {
        this.$refs.modalMessage.showModal({type: 'success', message: 'ControlsInPlace have been saved!'})
      })
    },
    onItemEdit(propertyKey, value, recordId) {
      editItem(this.controlsInPlace, this.editedControlsInPlace, propertyKey, value, recordId)
    }
  },
  data() {
    return {
      controlsInPlace: [],
      editedControlsInPlace: []
    }
  },
  apollo: {
    controlsInPlace: {
      query: GET_CONTROLS_IN_PLACE
    }
  },
  components: {
    SvgSave,
    ModalMessage
  }
}
</script>

<style>
.actions-container {
  text-align: right;
  padding-bottom: 10px;
  padding-right: 10px;
}

.edit-box {
  width: 100% !important;
}
</style>