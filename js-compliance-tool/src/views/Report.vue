<template>
  <div class="report-container">
    <div class="header">
      <h3>GDPR Compliance Tool Report</h3>
      <a href="/printreport">View Printer Friendly Report</a>
      <span class="report-description">
        The following is a completed assessment of GENERAL DATA PROTECTION REGULATION (GDPR) CONTROLS AND PROGRAM and overall data processing practices as it relates to your program.
        <br>
        We have evaluated your assessment criteria and compiled the responses below to help identify the areas of your program that are in most need for further remedation.
      </span>
    </div>
    <div class="report-table-container">
      <ReportTable :items="tableData" class="report-table"/>
      <div class="chart-card">
        <h5>Assessment Completion</h5>
        <div class="description">You have completed {{ completionPercentage }}% of the assessment so far.</div>
        <DoughnutChart v-if="loaded" :data-sets="chartData" :options="{responsive: true, maintainAspectRatio: true, legend: { display: false }}" class="chart"/>
        <a href="/">Continue Assessment</a>
      </div>
    </div>
  </div>
</template>

<script>
  import { cloneDeep } from 'lodash';

  import { GET_WORKSPACE_REGULATIONS } from "../api/graphql/workspace.js"

  import { getPriority } from '../data/processors.js'

  import ReportTable from '../components/ReportTable.vue'
  import DoughnutChart from '../components/DoughnutChart.vue'

  export default {
    name: 'Report',
    data() {
      return {
        workspaceRegulations: [],
        computedRegulations: [],
        loaded: false,
      }
    },
    computed: {
      tableData() {
        return typeof this.$route.query.s === 'undefined' ? this.computedRegulations : this.computedRegulations.filter(x => x.section.id === this.$route.query.s)
      },
      chartData() {
        return {
          labels: ['Complete', 'Incomplete'],
          datasets: [
            {
              backgroundColor: ['#00C28D', '#EDF2F5'],
              data: [this.inComplianceCount, this.notInComplianceCount]
            }
          ]
        }
      },
      inComplianceCount() {
        return this.tableData.filter(x => getPriority(x.controlInPlace.id, x.controlStatus.id, x.risk.id).id === 5).length
      },
      notInComplianceCount() {
        return this.tableData.length - this.inComplianceCount
      },
      completionPercentage() {
        return Math.round((this.inComplianceCount / this.tableData.length) * 100)
      }
    },
    apollo: {
      workspaceRegulations: {
        query: GET_WORKSPACE_REGULATIONS,
        result({ data }) {
          console.log('apollo call, report')
          this.computedRegulations = cloneDeep(data.workspaceRegulations).map(function(x) {
            return Object.assign({priority: getPriority(x.controlInPlace.id, x.controlStatus.id, x.risk.id)}, x)
          })
          this.loaded = true
        }
      }
    },
    components: {
      ReportTable,
      DoughnutChart
    }
  }
</script>

<style>
.report-container {
  text-align: left;
  max-width: 1200px;
  left: 0;
  right: 0;
  margin: auto;
}

.header {
  width: 60%;
}

.report-description {
  display: inline-block;
}

.report-table-container {
  padding-top: 20px;
}

.report-table-container .report-table {
  display: inline-block;
  width: 60%;
}

.report-table-container .chart-card {
  float: right;
  width: 25%;
  padding: 10px;
  border: 1px solid lightgray;
  box-shadow: 1px 2px 10px grey;
  background: white !important;
}

.report-table-container .chart-card .description {
  width: 50%;
  float: left;
  padding-top: 15px;
}

.report-table-container .chart {
  display: inline-block;
  width: 100px;
  height: 100px;
}
</style>
