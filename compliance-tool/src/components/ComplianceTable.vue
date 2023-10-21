<template>
  <div>
    <datatable :source="regulations" :line-numbers="true" class="data-table" :filterable="true" :filter-position="'top'">
      <datatable-column id="description" label="Description" width="25%" :sortable="false" :groupable="false" />
      <datatable-column id="controlInPlace" label="Control In Place" width="12.5%" :groupable="false" :tool-tip="'• Yes: Control is designed and implemented\r\n• No: Control is designed well but inconsistently implemented\r\n• N/A: Control is not applicable to your operations'">Control In Place <SvgInfo class="icon"/></datatable-column>
      <datatable-column id="controlStatus" label="Control Status" width="12.5%" :sortable="false" :groupable="false" :tool-tip="'• Effective: Control has been created and effectively implemented\r\n• Partially Effective: Control has been created but inconsistently implemented\r\n• Open: Control has not been created and/or not implemented\r\n• N/A: Control is not applicable to your operations'">Control Status  <SvgInfo class="icon" /></datatable-column>
      <datatable-column id="risk" label="Risk" width="8%" :groupable="false" :tool-tip="'• Critical: Very likely impact on the organization overall in terms of business processes, departments or performance\r\n• High: Will likely impact an organization in terms of business processes, departments or performance\r\n• Moderate: Impacts at least one organizational department or business unit in terms of business process, department or performance\r\n• Low: Minor impact on the organization in terms of the business process, department or performance\r\n• Very Low: Negligible impact on the organization in terms of the business process, department or performance\r\n• N/A: Control is not applicable to your operations'">Risk  <SvgInfo class="icon"/></datatable-column>
      <datatable-column id="priority" label="Priority" width="12%" :groupable="false" />
      <datatable-column id="comments" label="Comments" width="25%" :sortable="false" :groupable="false" />
      <template slot="description" slot-scope="cell">
        <a :href="cell.row.url" class="description" target="_blank">{{ cell.row.description }}</a>
      </template>
      <template slot="controlInPlace" slot-scope="cell">
        <select v-model="cell.row.controlInPlace.id" @change="$emit('controlInPlaceChange', $event.target.value, cell.row.id)">
          <option/>
          <option v-for="control in controlInPlace" :key="control.id" :value="control.id">
            {{ control.name }}
          </option>
        </select>  
      </template>
      <template slot="controlStatus" slot-scope="cell">
        <select v-model="cell.row.controlStatus.id" @change="$emit('controlStatusChange', $event.target.value, cell.row.id)">
          <option/>
          <option v-for="status in controlStatuses" :key="status.id" :value="status.id">
            {{ status.name }}
          </option>
        </select>
      </template>
      <template slot="risk" slot-scope="cell">
        <select v-model="cell.row.risk.id" @change="$emit('riskChange', $event.target.value, cell.row.id)">
          <option/>
          <option v-for="risk in risks" :key="risk.id" :value="risk.id">
            {{ risk.name }}
          </option>
        </select>
      </template>
      <template slot="priority" slot-scope="cell">
        <Priority :color="getPriority(cell.row.controlInPlace.id, cell.row.controlStatus.id, cell.row.risk.id).color"/>{{ getPriority(cell.row.controlInPlace.id, cell.row.controlStatus.id, cell.row.risk.id).name }}
      </template>
      <template slot="comments" slot-scope="cell">
        <input type="text" v-model="cell.row.comments" class="comments" @change="$emit('commentsChange', $event.target.value, cell.row.id)">
      </template>
    </datatable>
  </div>
</template>

<script>
import { cloneDeep } from 'lodash';

import controlStatuses from '../data/controlStatus.json'
import controlInPlace from '../data/controlInPlace.json'
import risks from '../data/risks.json'

import SvgInfo from 'fishtank-icons/info_32.svg'

import Priority from '../components/Priority.vue'

import { getPriority } from '../data/processors.js'


export default {
  props: {
    items: { type: Array, required: true }
  },
  data() {
    return {
      regulations: cloneDeep(this.items),
      controlStatuses,
      controlInPlace,
      risks
    }
  },
  methods: {
    getPriority(controlStatusId, controlInPlaceId, riskId) {
      return getPriority(controlStatusId, controlInPlaceId, riskId);
    }
  },
  components: {
    SvgInfo,
    Priority
  }
}

</script>

<style>

.data-table td select, .data-table td input{
  border: solid lightgray 1px;
}

.data-table .description {
  white-space: pre-line;
}

.row-disabled {
  background-color: lightgray;
}

.comments {
  width: 100% !important;
}

.tooltip.info{
  color: rgba(#004499, .9);
}

.tooltip.info .tooltip-inner {
  background: lightgray;
  color: black;
  padding: 15px;
  border-radius: 5px;
  box-shadow: 0 5px 30px rgba(black, .1);
  max-width: 250px;
}

.tooltip.info .tooltip-arrow {
  border-color: green;
}

</style>