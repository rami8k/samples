const data = [
  { id: 1, description: "Insert a section related to privacy and data protection into your Code of Conduct that accounts for each Regulation's six governing principles." },
  { id: 2, description: "Develop and maintain an Information Security Policy that covers all of the fundamental objectives and elements of safeguarding employee, customer, and third parties' personal data - integrate GDPR-specific processes into the basic policy." },
  { id: 3, description: "One of the Regulation's key elements is requiring companies to confirm with every data subject the agreement for processing of personal data related to him or her.\nMaintain records allowing for proof of consent from all data subjects. From the recitals on the Regulation, \"Consent should be given by a clear affirmative act establishing a freely given, specific, informed and unambiguous indication of the data subject's agreement to the processing of personal data relating to him or her, such as by a written statement, including by electronic means, or an oral statement.\nThis could include ticking a box when visiting an internet website, choosing technical settings for information society services or another statement or conduct which clearly indicates in this context the data subject's acceptance of the proposed processing of his or her personal data. Silence, pre-ticked boxes or inactivity should not therfore constitute consent." },
  { id: 3, description: "Implement an Incedent Response Plan and integrate a data incident tracking log for use in all breach situations." }
]

module.exports = {
  findAll: function () {
    return data
  },
  findById: function (id) {
    return data.find(x => x.id === id);
  },
  findBySectionId: function (sectionId) {
    return data.find(x => x.sectionId === sectionId);
  },
  sync: function () {
  }
}