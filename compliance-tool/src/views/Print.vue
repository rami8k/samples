<template>
  <div>
    <PrintComplianceTable :items="complianceData"/>
  </div>
</template>

<script>
  import PrintComplianceTable from '../components/PrintComplianceTable.vue'

  export default {
    name: 'Print',
    data() {
      return {
        items: [
          { index: 1, section: 'Governance', area: 'Policy & Procedures', description: 'Your Code of Conduct covers privacy and data protection principles', url: 'http://domain.com', controlInPlace: 'Yes', controlStatus: 'Effective', risk: 'Low', priority: 'Low Priority', comments: 'test comment' },
          { index: 2, section: 'Governance', area: 'Policy & Procedures', description: 'You have a corporate policy that covers GDPR requirements', url: null, controlInPlace: 'No', controlStatus: 'Partially Effective', risk: 'Hight', priority: 'Moderate Priority', comments: '' },
          { index: 3, section: 'Governance', area: 'Policy & Procedures', description: 'You have an Information Security Policy', url: null, controlInPlace: 'Yes', controlStatus: 'Open', risk: 'Critical', priority: 'Currently In Compliance', comments: '' },
          { index: 4, section: 'Governance', area: 'Policy & Procedures', description: 'You have a Records and Information Management Policy', url: 'http://domain.com', controlInPlace: 'No', controlStatus: 'N/A', risk: 'Low', priority: 'Currently In Compliance', comments: '' },
          { index: 5, section: 'Governance', area: 'Policy & Procedures', description: 'You have Data Breach / Incident Response Procedures', url: null, controlInPlace: 'No', controlStatus: 'Open', risk: 'Very Low', priority: 'Serious Priority', comments: '' },
          { index: 6, section: 'Governance', area: 'Policy & Procedures', description: 'You have a Business Continuity Plan Policy', url: null, controlInPlace: 'Yes', controlStatus: 'Effective', risk: 'Low', priority: 'Not Applicable', comments: '' },
          { index: 7, section: 'Governance', area: 'Policy & Procedures', description: 'You have documented procedures for storing personal data', url: null, controlInPlace: 'Yes', controlStatus: 'Effective', risk: 'Low', priority: 'Highest Priority', comments: '' },
          { index: 8, section: 'Governance', area: 'Policy & Procedures', description: 'You have Human Resources Policies on employee data rights', url: null, controlInPlace: 'Yes', controlStatus: 'Effective', risk: 'Very Low', priority: 'Low Priority', comments: '' },
          { index: 9, section: 'Governance', area: 'Policy & Procedures', description: 'You have reviewed the 99 articles of the GDPR and related guidance to determine how the regulation applies to your operations', url: null, controlInPlace: 'Yes', controlStatus: 'Effective', risk: 'Low', priority: 'Currently In Compliance', comments: '' },
          { index: 10, section: 'DPO', area: 'Policy & Procedures', description: 'Your Code of Conduct covers privacy and data protection principles', url: 'http://domain.com', controlInPlace: 'Yes', controlStatus: 'Effective', risk: 'Low', priority: 'Low Priority', comments: 'test comment' },
          { index: 11, section: 'DPO', area: 'Policy & Procedures', description: 'You have a corporate policy that covers GDPR requirements', url: null, controlInPlace: 'No', controlStatus: 'Partially Effective', risk: 'Hight', priority: 'Moderate Priority', comments: '' },
          { index: 12, section: 'DPO', area: 'Policy & Procedures', description: 'You have an Information Security Policy', url: null, controlInPlace: 'Yes', controlStatus: 'Open', risk: 'Critical', priority: 'Currently In Compliance', comments: '' },
          { index: 13, section: 'Notices', area: 'Policy & Procedures', description: 'You have a Records and Information Management Policy', url: 'http://domain.com', controlInPlace: 'No', controlStatus: 'N/A', risk: 'Low', priority: 'Currently In Compliance', comments: '' },
          { index: 14, section: 'Notices', area: 'Policy & Procedures', description: 'You have a Business Continuity Plan Policy', url: null, controlInPlace: 'Yes', controlStatus: 'Effective', risk: 'Low', priority: 'Not Applicable', comments: '' },
        ]
      }
    },
    computed: {
      complianceData() {
        return typeof this.$route.query.s === 'undefined' ? this.items : this.items.filter(x => x.section.toLowerCase() === this.$route.query.s.toLowerCase())
      },
      reportData() {
        return []
      }
    },
    components: {
      PrintComplianceTable
    }
  }
</script>