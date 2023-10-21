<template>
  <div class="report-table">
    <collapse class="collapse-" :selected="true" v-for="priority in priorities" :key="priority.name" v-if="prioritySections(priority).length > 0">
      <div slot="collapse-header" class="header-item">
        <Priority :color="priority.color"/><span class="header-item-text">{{ priority.name }}</span>
      </div>
      <div slot="collapse-body">
        <div v-for="item in prioritySections(priority)" :key="item.section.id" class="priority-card">
          <h4>{{ item.section.name }}</h4>
          <ul>
            <li v-for="item in items.filter(x => x.priority.id === priority.id && x.section.id === item.section.id)" :key="item.id" class="regulation-card">
              <span class="description">{{ item.description }}</span>
              <div v-if="item.guidance">
                <h5>MITIGATION GUIDANCE</h5>
                {{ item.guidance }}
              </div>
            </li>
          </ul>
        </div>
      </div>
    </collapse>
  </div>
</template>

<script>
  import Priority from '../components/Priority.vue'
  import Collapse from 'vue-collapse'
  import priorities from '../data/priority.json'

  import { unique } from '../helpers/unique.js'

  export default {
    props: {
      items: { type: Array, required: true}
    },
    data() {
      return {
        priorities: priorities
      }
    },
    methods: {
      unique(items, key) {
        return unique(items, key)
      },
      prioritySections(priority) {
        return unique(this.items.filter(x => x.priority.id === priority.id), 'section')
      }
    },
    components: {
      Priority,
      Collapse
    }
  }
</script>

<style>

.report-table .collapse {
  border-right: inherit;
}

.report-table .collapse-header {
  width: 100%;
  text-align: left;
  padding: 10px 20px 10px 40px !important;
  border: 1px solid lightgray;
  box-shadow: 1px 2px 10px grey;
  background: white !important;
  cursor: pointer;
}

.report-table .header-item {
  justify-content: unset !important;
}

.report-table .header-item-text {
  float: left;
}

.report-table .report-item-list {
  text-align: left;
}

.report-table .collapse-content-box {
  padding: 10px 20px;
}

.report-table .description {
  white-space: pre-line;
}

.priority-card {
  text-align: left;
}

.priority-card .regulation-card {
  padding-top: 10px;
}

.regulation-card .description {
  font-size: 16px;
}

</style>