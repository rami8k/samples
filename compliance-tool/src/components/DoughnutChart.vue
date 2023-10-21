<script>
import { Doughnut } from 'vue-chartjs'

export default {
  extends: Doughnut,
  props: {
    dataSets: { type: Object, required: true},
    options: {type: Object, required: false, default: null}
  },
  mounted () {
    this.renderChart(this.dataSets, this.options)
  }
}
</script>