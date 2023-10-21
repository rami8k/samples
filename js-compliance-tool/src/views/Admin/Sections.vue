<template>
  <div>
    <div class="actions-container">
      <button class="action-button" @click="save()"><SvgSave class="icon"/> Save</button>
    </div>
    <div class="table-container">
      <datatable :source="sections" :line-numbers="true" class="data-table" :filterable="true" :filter-position="'top'">
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
import { GET_SECTIONS, UPDATE_SECTIONS } from "../../api/graphql/sections";

import { editItem } from '../../helpers/editItem'

import ModalMessage from '../../components/ModalMessage'
import SvgSave from 'fishtank-icons/save_32.svg'

export default {
  methods: {
    saveWorkspace() {
      this.$apollo.mutate({
        mutation: UPDATE_SECTIONS,
        variables: {
          updatedSections: this.editedSections
        }
      }).then(async (data) => {
        this.$refs.modalMessage.showModal({type: 'success', message: 'Sections have been saved!'})
      })
    },
    onItemEdit(propertyKey, value, recordId) {
      editItem(this.sections, this.editedSections, propertyKey, value, recordId)
    }
  },
  data() {
    return {
      sections: [],
      editedSections: []
    }
  },
  apollo: {
    sections: {
      query: GET_SECTIONS
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