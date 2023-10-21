<template>
  <div>
    <div class="actions-container">
      <button class="action-button" @click="save()"><SvgSave class="icon"/> Save</button>
    </div>
    <div class="table-container">
      <div class="new-item">
        Name: <input type="text" v-model="model.name"><a @click="addItem"><SvgAdd class="crud-icon"/></a>
      </div>
      <datatable :source="companies" :line-numbers="true" class="data-table" :filterable="true" :filter-position="'top'">
        <datatable-column id="id" label="Id" width="5%" :sortable="false" :groupable="false" />
        <datatable-column id="name" label="Name" :sortable="false" :groupable="false" />
        <datatable-column id="actions" label="Delete" :sortable="false" :groupable="false" />
        <template slot="name" slot-scope="cell">
          <input type="text" class="edit-box" v-model="cell.row.name" @change="onItemEdit('name', $event.target.value, cell.row.id)">
        </template>
        <template slot="actions" slot-scope="cell">
          <a @click="preDelete(cell.row)"><SvgDelete class="crud-icon"/></a>
        </template>
      </datatable>
    </div>
    <Modal ref="modalMessage"/>
  </div>
</template>

<script>
import { GET_COMPANIES, UPDATE_COMPANIES, DELETE_COMPANY } from "../../api/graphql/company";

import { cloneDeep } from 'lodash';

import { editItem } from '../../helpers/editItem'

import Modal from '../../components/Modal'
import SvgSave from 'fishtank-icons/save_32.svg'
import SvgAdd from 'fishtank-icons/bcite-positive_24.svg'
import SvgDelete from 'fishtank-icons/bcite-negative_24.svg'

export default {
  methods: {
    save() {
      this.$apollo.mutate({
        mutation: UPDATE_COMPANIES,
        variables: {
          updatedCompanies: this.editedCompanies
        }
      }).then(async (data) => {
        this.$refs.modalMessage.showMessage({type: 'success', message: 'List has been saved!'})
      })
    },
    onItemEdit (propertyKey, value, recordId) {
      editItem(this.companies, this.editedCompanies, propertyKey, value, recordId)
    },
    addItem() {
      let newItem = Object.assign({id: 0}, this.model)
      this.companies.push(newItem)
      this.editedCompanies.push(newItem)

      this.model = {}
    },
    preDelete(item) {
      this.$refs.modalMessage.showDialog({type: 'alert', message: 'Company will be deleted?', onOk: () => this.deleteItem(item)})
    },
    deleteItem(item) {
      this.companies.splice(this.companies.indexOf(item), 1)
      this.editedCompanies.splice(this.editedCompanies.indexOf(item), 1)

      this.$apollo.mutate({
        mutation: DELETE_COMPANY,
        variables: {
          id: item.id
        }
      }).then(async (data) => {
        this.$refs.modalMessage.showMessage({type: 'success', message: 'Item has been deleted!'})
      })
    }
  },
  data() {
    return {
      companies: [],
      editedCompanies: [],
      model: {}
    }
  },
  apollo: {
    companies: {
      query: GET_COMPANIES,
      result({ data }) {
        this.companies = cloneDeep(data.companies)
      },
    }
  },
  components: {
    SvgSave,
    SvgAdd,
    SvgDelete,
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

.new-item {
  text-align: left;
  padding: 20px;
}
</style>