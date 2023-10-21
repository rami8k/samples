<template>
  <div>
    <div class="actions-container">
      <button class="action-button" @click="save()"><SvgSave class="icon"/> Save</button>
    </div>
    <div class="table-container">
      <datatable :source="regulations" :line-numbers="true" class="data-table" :filterable="true" :filter-position="'top'">
        <datatable-column id="id" label="Id" width="5%" :sortable="false" :groupable="false" />
        <datatable-column id="description" label="Description" width="45%" :sortable="false" :groupable="false" />
        <datatable-column id="url" label="Url" width="45%" :sortable="false" :groupable="false" />
        <template slot="description" slot-scope="cell">
          <textarea v-model="cell.row.description" class="edit-box edit-textara" @change="onItemEdit('description', $event.target.value, cell.row.id)"/>
        </template>
        <template slot="url" slot-scope="cell">
          <input type="text" v-model="cell.row.url" class="edit-box" @change="onItemEdit('url', $event.target.value, cell.row.id)">
        </template>
      </datatable>
    </div>
    <ModalMessage ref="modalMessage"/>
  </div>
</template>

<script>
import { GET_REGULATIONS, UPDATE_REGULATIONS } from "../../api/graphql/regulations.js"

import { editItem } from '../../helpers/editItem'

import ModalMessage from '../../components/ModalMessage'
import SvgSave from 'fishtank-icons/save_32.svg'

export default {
  methods: {
    saveWorkspace() {
      this.$apollo.mutate({
        mutation: UPDATE_REGULATIONS,
        variables: {
          updatedRegulations: this.editedRegulations
        }
      }).then(async (data) => {
        this.$refs.modalMessage.showModal({type: 'success', message: 'Regulations have been saved!'})
      })
    },
    onItemEdit(propertyKey, value, recordId) {
      editItem(this.regulations, this.editedRegulations, propertyKey, value, recordId)
    }
  },
  data() {
    return {
      regulations: [],
      editedRegulations: []
    }
  },
  apollo: {
    regulations: {
      query: GET_REGULATIONS
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

.edit-box .edit-textarea {
  white-space:pre;
  height: 100%;
}
</style>