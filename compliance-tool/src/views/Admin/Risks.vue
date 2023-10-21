<template>
  <div>
    <div class="actions-container">
      <button class="action-button" @click="save()"><SvgSave class="icon"/> Save</button>
    </div>
    <div class="table-container">
      <datatable :source="risks" :line-numbers="true" class="data-table" :filterable="true" :filter-position="'top'">
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
import { GET_RISKS, UPDATE_RISKS } from "../../api/graphql/risks";

import { editItem } from '../../helpers/editItem'

import ModalMessage from '../../components/ModalMessage'
import SvgSave from 'fishtank-icons/save_32.svg'

export default {
  methods: {
    saveWorkspace() {
      this.$apollo.mutate({
        mutation: UPDATE_RISKS,
        variables: {
          updatedRisks: this.editedRisks
        }
      }).then(async (data) => {
        this.$refs.modalMessage.showModal({type: 'success', message: 'Risks have been saved!'})
      })
    },
    onRiskEdit(propertyKey, value, recordId) {
      editItem(this.risks, this.editedRisks, propertyKey, value, recordId)
    }
  },
  data() {
    return {
      risks: [],
      editedRisks: []
    }
  },
  apollo: {
    risks: {
      query: GET_RISKS
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