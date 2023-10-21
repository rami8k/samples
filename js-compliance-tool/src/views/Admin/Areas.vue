<template>
  <div>
    <div class="actions-container">
      <button class="action-button" @click="save()"><SvgSave class="icon"/> Save</button>
    </div>
    <div class="table-container">
      <datatable :source="areas" :line-numbers="true" class="data-table" :filterable="true" :filter-position="'top'">
        <datatable-column id="id" label="Id" width="5%" :sortable="false" :groupable="false" />
        <datatable-column id="sectionId" label="Section Id" width="25%" :sortable="false" :groupable="false" />
        <datatable-column id="name" label="Name" :sortable="false" :groupable="false" />
        <template slot="sectionId" slot-scope="cell">
          <select v-model="cell.row.sectionId" @change="onItemEdit('sectionId', $event.target.value, cell.row.id)">
            <option v-for="section in sections" :key="section.id" :value="section.id">
              {{ section.name }}
            </option>
          </select>
        </template>
        <template slot="name" slot-scope="cell">
          <input type="text" class="edit-box" v-model="cell.row.name" @change="onItemEdit('name', $event.target.value, cell.row.id)">
        </template>
      </datatable>
    </div>
    <Modal ref="modalMessage"/>
  </div>
</template>

<script>
import { GET_AREAS, UPDATE_AREAS } from "../../api/graphql/areas";
import sections from '../../data/sections.json'

import { editItem } from '../../helpers/editItem'

import Modal from '../../components/Modal'

import SvgSave from 'fishtank-icons/save_32.svg'

export default {
  methods: {
    saveWorkspace() {
      this.$apollo.mutate({
        mutation: UPDATE_AREAS,
        variables: {
          updatedAreas: this.editedAreas
        }
      }).then(async (data) => {
        this.$refs.modalMessage.showModal({type: 'success', message: 'Areas have been saved!'})
      })
    },
    onItemEdit(propertyKey, value, recordId) {
      editItem(this.areas, this.editedAreas, propertyKey, value, recordId)
    }
  },
  data() {
    return {
      sections: sections,
      areas: [],
      editedAreas: []
    }
  },
  apollo: {
    areas: {
      query: GET_AREAS
    }
  },
  components: {
    SvgSave,
    Modal
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