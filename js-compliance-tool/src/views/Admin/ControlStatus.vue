<template>
  <div>
    <div class="actions-container">
      <button class="action-button" @click="save()"><SvgSave class="icon"/> Save</button>
    </div>
    <div class="table-container">
      <datatable :source="controlStatuses" :line-numbers="true" class="data-table" :filterable="true" :filter-position="'top'">
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
import { GET_CONTROL_STATUSES, UPDATE_CONTROLS_STATUSES } from "../../api/graphql/controlStatus";

import { editItem } from '../../helpers/editItem'

import ModalMessage from '../../components/ModalMessage'
import SvgSave from 'fishtank-icons/save_32.svg'

export default {
  methods: {
    saveWorkspace() {
      this.$apollo.mutate({
        mutation: UPDATE_CONTROLS_STATUSES,
        variables: {
          updatedControlStatus: this.editedControlStatus
        }
      }).then(async (data) => {
        this.$refs.modalMessage.showModal({type: 'success', message: 'ControlStatus have been saved!'})
      })
    },
    onItemEdit(propertyKey, value, recordId) {
      editItem(this.controlStatuses, this.editedControlStatus, propertyKey, value, recordId)
    }
  },
  data() {
    return {
      controlStatuses: [],
      editedcontrolStatuses: []
    }
  },
  apollo: {
    controlStatuses: {
      query: GET_CONTROL_STATUSES
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