<template>
  <div>
    <datatable :source="items" :line-numbers="true" :filterable="false" class="data-table">
      <datatable-column id="area" label="Area" width="10%" />
      <datatable-column id="description" label="Description" width="20%" :sortable="false" />
      <datatable-column id="controlInPlace" label="Control In Place" width="5%" />
      <datatable-column id="controlStatus" label="Control Status" :sortable="false" :groupable="false" width="10%" />
      <datatable-column id="risk" label="Risk" width="5%" />
      <datatable-column id="priority" label="Priority" width="10%" />
      <datatable-column id="comments" label="Comments" width="20%" :sortable="false" />
      <template slot="description" slot-scope="cell">
        <a :href="cell.row.url" style="white-space: normal;" target="_blank">{{ cell.row.description }}</a>
      </template>
      <template slot="priority" slot-scope="cell">
        <Priority :color="priorityColor(cell.row.priority)"/>{{ cell.row.priority }}
      </template>
    </datatable>
  </div>
</template>

<script>
  import Priority from '../components/Priority.vue'
  import SvgInfo from 'fishtank-icons/info_32.svg'

  import { getPriorityColor } from '../data/processors.js'

  export default {
    props: {
      items: { type: Array, required: true}
    },
    methods: {
      priorityColor(priority) {
        return getPriorityColor(priority).color;
      }
    },
    components: {
      SvgInfo,
      Priority
    }
  }
</script>

<style>
</style>