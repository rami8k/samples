<template>
  <div>
    <div class="actions-container">
      <router-link :to="{ name: 'print'}" class="action-button"><SvgPrint class="icon"/> Print</router-link>
      <router-link :to="{ name: 'report'}" class="action-button"><SvgReport class="icon"/> Full Report</router-link>
      <a class="action-button" :href="`${server_url}/api/report`"><SvgDownload class="icon"/> Download</a>
      <button class="action-button" @click="saveWorkspace()"><SvgSave class="icon"/> Save Workspace</button>
    </div>
    <div>
      <collapse :selected="false" v-for="section in sections" :key="section.id">
        <div slot="collapse-header">
          {{ section.name }}
        </div>
        <div slot="collapse-body">
          <div class="actions-container section">
            <router-link :to="{ name: 'print', query: { s: section.id }}" class="action-button"><SvgPrint class="icon"/> Print</router-link>
            <router-link :to="{ name: 'report', query: { s: section.id }}" class="action-button"><SvgReport class="icon"/> Section Report</router-link>
            <a class="action-button" :href="`${server_url}/api/report?s=${section.id}`"><SvgDownload class="icon"/> Download</a>
            <a class="action-button" @click="saveWorkspace()"><SvgSave class="icon"/> Save Workspace</a>
          </div>
          <div class="data-table">
            <ComplianceTable :items="workspaceRegulations.filter(x => x.section.id === section.id)" @controlInPlaceChange="onControlInPlaceChange" @controlStatusChange="onControlStatusChange" @riskChange="onRiskChange" @commentsChange="onCommentsChange"/>
          </div>
        </div>
      </collapse>
    </div>
    <Modal ref="modalMessage"/>
  </div>
</template>

<script>
import { GET_WORKSPACE_REGULATIONS, UPDATE_WORKSPACE_REGULATIONS } from "../api/graphql/workspace.js"

import Collapse from 'vue-collapse'
import ComplianceTable from '../components/ComplianceTable.vue'
import Modal from '../components/Modal'

import sections from '../data/sections.json'

import SvgDownload from 'fishtank-icons/download_24.svg'
import SvgReport from 'fishtank-icons/doc-chart_24.svg'
import SvgPrint from 'fishtank-icons/print_32.svg'
import SvgSave from 'fishtank-icons/save_32.svg'

export default {
  methods: {
    getReport() {

    },
    download() {

    },
    saveWorkspace() {
      this.$apollo.mutate({
        mutation: UPDATE_WORKSPACE_REGULATIONS,
        variables: {
          updatedRegulations: this.editedRegulations
        }
      }).then(async (data) => {
        this.$refs.modalMessage.showMessage({type: 'success', message: 'Workspace has been saved!'})
      })
    },
    onRegulationEdit (propertyKey, value, datatype, recordId) {
      var editedRegulation = this.editedRegulations.find(x => x.id === recordId)

      if (typeof editedRegulation !== 'undefined') {
        editedRegulation[propertyKey] = datatype(value)
      } else {
        var immutableRegulation = this.workspaceRegulations.find(x => x.id === recordId)

        var newEditedRecord = Object.assign({}, {
          id: immutableRegulation.id,
          controlInPlaceId: immutableRegulation.controlInPlace.id, 
          controlStatusId: immutableRegulation.controlStatus.id, 
          riskId: immutableRegulation.risk.id, 
          comments: immutableRegulation.comments})

        newEditedRecord[propertyKey] = datatype(value)
        this.editedRegulations.push(newEditedRecord)
      }
    },
    onControlInPlaceChange(newValue, recordId) {
      this.onRegulationEdit('controlInPlaceId', newValue, Number, recordId)
    },
    onControlStatusChange(newValue, recordId) {
      this.onRegulationEdit('controlStatusId', newValue, Number, recordId)
    },
    onRiskChange(newValue, recordId) {
      this.onRegulationEdit('riskId', newValue, Number, recordId)
    },
    onCommentsChange(newValue, recordId) {
      this.onRegulationEdit('comments', newValue, String, recordId)
    }
  },
  data() {
    return {
      sections: sections,
      server_url: process.env.GRAPHQL_SERVER,
      items: [
        { index: 1, sectionId: 1, areaId: 1, description: 'Your Code of Conduct covers privacy and data protection principles', url: 'http://domain.com', controlInPlaceId: 0, controlStatusId: 0, riskId: 0, priorityId: 0, comments: '' },
        { index: 2, sectionId: 1, areaId: 1, description: 'You have a corporate policy that covers GDPR requirements', url: null, controlInPlaceId: 0, controlStatusId: 0, riskId: 0, priorityId: 0, comments: '' },
        { index: 3, sectionId: 1, areaId: 1, description: 'You have an Information Security Policy', url: null, controlInPlaceId: 0, controlStatusId: 0, riskId: 0, priorityId: 0, comments: '' },
        { index: 4, sectionId: 1, areaId: 1, description: 'You have a Records and Information Management Policy', url: 'http://domain.com', controlInPlaceId: 0, controlStatusId: 0, riskId: 0, priorityId: 0, comments: '' },
        { index: 5, sectionId: 1, areaId: 1, description: 'You have Data Breach / Incident Response Procedures', url: null, controlInPlaceId: 0, controlStatusId: 0, riskId: 0, priorityId: 0, comments: '' },
        { index: 6, sectionId: 1, areaId: 1, description: 'You have a Business Continuity Plan Policy', url: null, controlInPlaceId: 0, controlStatusId: 0, riskId: 0, priorityId: 0, comments: '' },
        { index: 7, sectionId: 1, areaId: 1, description: 'You have documented procedures for storing personal data', url: null, controlInPlaceId: 0, controlStatusId: 0, riskId: 0, priorityId: 0, comments: '' },
        { index: 8, sectionId: 1, areaId: 1, description: 'You have Human Resources Policies on employee data rights', url: null, controlInPlaceId: 0, controlStatusId: 0, riskId: 0, priorityId: 0, comments: '' },
        { index: 9, sectionId: 1, areaId: 1, description: 'You have reviewed the 99 articles of the GDPR and related guidance to determine how the regulation applies to your operations', url: null, controlInPlaceId: 0, controlStatusId: 0, riskId: 0, priorityId: 0, comments: '' },
        { index: 10, sectionId: 2, areaId: 1, description: 'Your Code of Conduct covers privacy and data protection principles', url: 'http://domain.com', controlInPlaceId: 0, controlStatusId: 0, riskId: 0, priorityId: 0, comments: '' },
        { index: 11, sectionId: 2, areaId: 1, description: 'You have a corporate policy that covers GDPR requirements', url: null, controlInPlaceId: 0, controlStatusId: 0, riskId: 0, priorityId: 0, comments: '' },
        { index: 12, sectionId: 2, areaId: 1, description: 'You have an Information Security Policy', url: null, controlInPlaceId: 0, controlStatusId: 0, riskId: 0, priorityId: 0, comments: '' },
        { index: 13, sectionId: 4, areaId: 1, description: 'You have a Records and Information Management Policy', url: 'http://domain.com', controlInPlaceId: 0, controlStatusId: 0, riskId: 0, priorityId: 0, comments: '' },
        { index: 14, sectionId: 4, areaId: 1, description: 'You have a Business Continuity Plan Policy', url: null, controlInPlaceId: 0, controlStatusId: 0, riskId: 0, priorityId: 0, comments: '' },
      ],
      workspaceRegulations: [],
      editedRegulations: []
    }
  },
  apollo: {
    workspaceRegulations: {
      query: GET_WORKSPACE_REGULATIONS
    }
  },
  components: {
    Collapse,
    ComplianceTable,
    SvgDownload,
    SvgReport,
    SvgPrint,
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

.actions-container.section {
  padding-right: 0px;
}

.accordion-button {
  width: 100%;
}

.collapse-header {
  padding: 10px 10px 10px 20px !important;
  cursor: pointer;
}
</style>