import DataLoader from 'dataloader'

const data = [
  { id: 1, name: "Policy & Procedures", sectionId: 1 },
  { id: 2, name: "Application", sectionId: 1 },
  { id: 3, name: "Data  Mapping", sectionId: 1 },
  { id: 4, name: "Data Controller / Processor Assessment", sectionId: 1 },
  { id: 5, name: "Codes / Certifications", sectionId: 1 },
  { id: 6, name: "Privacy By Design", sectionId: 1 },
  { id: 7, name: "Six Principles", sectionId: 1 },
  { id: 8, name: "Roles and Responsibilities", sectionId: 1 },
  { id: 9, name: "Employee Rights", sectionId: 1 },
  { id: 10, name: "Oversight", sectionId: 1 },
  { id: 11, name: "Questions from Data Subjects", sectionId: 1 },

  { id: 12, name: "Appointment", sectionId: 2 },
  { id: 13, name: "Authority", sectionId: 2 },
  { id: 14, name: "Governance Structure", sectionId: 2 },
  { id: 15, name: "Notice", sectionId: 2 },
  { id: 16, name: "Credentials", sectionId: 2 },
  { id: 17, name: "Tasks", sectionId: 2 },
  { id: 18, name: "Contact", sectionId: 2 },
  { id: 19, name: "Oversight", sectionId: 2 },
  { id: 20, name: "Conflicts", sectionId: 2 },

  { id: 21, name: "Lawful Processing", sectionId: 3 },
  { id: 22, name: "Format", sectionId: 3 },
  { id: 23, name: "Withdrawal", sectionId: 3 },
  { id: 24, name: "Bundled", sectionId: 3 },
  { id: 25, name: "Training", sectionId: 3 },
  { id: 26, name: "Audit", sectionId: 3 },
  { id: 27, name: "Publication", sectionId: 3 },
  { id: 28, name: "Contingency", sectionId: 3 },
  { id: 29, name: "Children", sectionId: 3 },

  { id: 30, name: "Timing", sectionId: 4 },
  { id: 31, name: "Process", sectionId: 4 },
  { id: 32, name: "Amendments", sectionId: 4 },

  { id: 99, name: "Notice to Data Subject", sectionId: 5 },
  { id: 99, name: "Records", sectionId: 5 },

  { id: 99, name: "Procedures", sectionId: 6 },
  { id: 99, name: "Exemption", sectionId: 6 },
  { id: 99, name: "Fees", sectionId: 6 },
  { id: 99, name: "Right to be Informed", sectionId: 6 },
  { id: 99, name: "Right of Access", sectionId: 6 },
  { id: 99, name: "Right to Object", sectionId: 6 },
  { id: 99, name: "Right to Rectify", sectionId: 6 },
  { id: 99, name: "Right to Erasure (or be forgotten)", sectionId: 6 },
  { id: 99, name: "Right to Erasure", sectionId: 6 },
  { id: 99, name: "Right to Restrict Processing", sectionId: 6 },
  { id: 99, name: "Right to Data Portability", sectionId: 6 },
  { id: 99, name: "Direct Marketing", sectionId: 6 },
  { id: 99, name: "Direct Marketing", sectionId: 6 },
  { id: 99, name: "Direct Marketing", sectionId: 6 },
  { id: 99, name: "Direct Marketing", sectionId: 6 },
  { id: 99, name: "Direct Marketing", sectionId: 6 },
  { id: 99, name: "Direct Marketing", sectionId: 6 },
  
  { id: 99, name: "Back-ups", sectionId: 7 },
  { id: 99, name: "Framework", sectionId: 7 },
  { id: 99, name: "Destruction", sectionId: 7 },
  { id: 99, name: "Passwords", sectionId: 7 },
  { id: 99, name: "Access", sectionId: 7 },
  { id: 99, name: "Security Defaults", sectionId: 7 },
  { id: 99, name: "Audits", sectionId: 7 },
  { id: 99, name: "Business Continuity", sectionId: 7 },
  { id: 99, name: "Business Continuity", sectionId: 7 },

  { id: 99, name: "Determination", sectionId: 8 },
  { id: 99, name: "Process", sectionId: 8 },
  { id: 99, name: "Records", sectionId: 8 },
  { id: 99, name: "Reporting", sectionId: 8 },
  { id: 99, name: "Results", sectionId: 8 },
  { id: 99, name: "Systems / Applications", sectionId: 8 },
  { id: 99, name: "Supervisory Authority", sectionId: 8 },

  { id: 99, name: "Awareness", sectionId: 9 },
  { id: 99, name: "Training Program", sectionId: 9 },
  { id: 99, name: "Third-Parties", sectionId: 9 },

  { id: 99, name: "Plan", sectionId: 10 },
  { id: 99, name: "Audits", sectionId: 10 },
  { id: 99, name: "Monitoring", sectionId: 10 },
  { id: 99, name: "Assessments", sectionId: 10 },
  { id: 99, name: "Results", sectionId: 10 },
  { id: 99, name: "Remediation", sectionId: 10 },
  { id: 99, name: "Records", sectionId: 10 },

  { id: 99, name: "Due Diligence", sectionId: 11 },
  { id: 99, name: "Contract", sectionId: 11 },
  { id: 99, name: "Security", sectionId: 11 },
  { id: 99, name: "Assessments", sectionId: 11 },
  { id: 99, name: "Data Protection Officer", sectionId: 11 },
  { id: 99, name: "Monitoring", sectionId: 11 },
  { id: 99, name: "Training", sectionId: 11 },
  { id: 99, name: "Breaches", sectionId: 11 },
  { id: 99, name: "Records", sectionId: 11 },

  { id: 99, name: "Security", sectionId: 12 },
  { id: 99, name: "Assessment", sectionId: 12 },
  { id: 99, name: "Authorization", sectionId: 12 },
  { id: 99, name: "Contract", sectionId: 12 },
  { id: 99, name: "Engagement", sectionId: 12 },
  { id: 99, name: "Safeguards", sectionId: 12 },

  { id: 99, name: "Program", sectionId: 13 },
  { id: 99, name: "Governance", sectionId: 13 },
  { id: 99, name: "Policy", sectionId: 13 },
  { id: 99, name: "Procedures", sectionId: 13 },
  { id: 99, name: "Inventory", sectionId: 13 },
  { id: 99, name: "Assessments", sectionId: 13 },
  { id: 99, name: "Training", sectionId: 13 },
  { id: 99, name: "Notices and Consents", sectionId: 13 },
  { id: 99, name: "Privacy by Design", sectionId: 13 },
  { id: 99, name: "Monitoring and Audit ", sectionId: 13 },
]

// const dataLoader = new DataLoader(async (ids) => {
//   return ids.map(id =>
//     data.find((x) => x.id === id),
//   );
// });

module.exports = {
  findAll: function () {
    return data
  },
  findById: function (id) {
    return data.find((x) => x.id === id)
  },
  findBySectionId: function (sectionId) {
    return data.find(x => x.sectionId === sectionId);
  },
  sync: function () {
  }
}