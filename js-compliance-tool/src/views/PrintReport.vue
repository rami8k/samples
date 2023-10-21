<template>
  <div class="report-container">
    <div class="header">
      <h3>GDPR Compliance Tool Report</h3>
      <span class="report-description">
        The following is a completed assessment of GENERAL DATA PROTECTION REGULATION (GDPR) CONTROLS AND PROGRAM and overall data processing practices as it relates to your program.
        <br>
        We have evaluated your assessment criteria and compiled the responses below to help identify the areas of your program that are in most need for further remedation.
      </span>
    </div>
    <div class="chart-card">
      <div class="chart-card-header">
        <h5>Assessment Completion</h5>
        <div class="description">You have completed {{ completionPercentage }}% of the assessment so far.</div>
      </div>
      <DoughnutChart v-if="loaded" :data-sets="chartData" :options="{responsive: true, maintainAspectRatio: true}" class="chart"/>
    </div>
    <div class="report-table-container">
      <ReportTable :items="tableData" class="report-table"/>
    </div>
  </div>
</template>

<script>
  import { cloneDeep } from 'lodash';

  import { GET_REGULATIONS } from "../api/graphql/regulations.js"

  import { getPriority } from '../data/processors.js'

  import ReportTable from '../components/ReportTable.vue'
  import DoughnutChart from '../components/DoughnutChart.vue'

  export default {
    name: 'Report',
    data() {
      return {
        regulations: [],
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
      regulations: {
        query: GET_REGULATIONS,
        result({ data }) {
          this.computedRegulations = cloneDeep(data.regulations).map(function(x) {
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
  max-width: 800px;
  left: 0;
  right: 0;
  margin: auto;
}

.report-description {
  display: inline-block;
}

.report-table-container {
  padding-top: 20px;
}

.report-table-container .report-table {
  display: inline-block;
}

.chart-card {
  padding: 10px;
  border: 1px solid lightgray;
  box-shadow: 1px 2px 10px grey;
  background: white !important;
}

.chart-card .chart-card-header {
  width: 50%;
  float: left;
}

.chart-card .description {
  width: 50%;
  float: left;
  padding-top: 15px;
}

.chart-card .chart {
  display: inline-block;
  width: 200px;
  height: 200px;
}
</style>
