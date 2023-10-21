import DataLoader from 'dataloader'


const data = [
  { id: 1, name: "Governance" },
  { id: 2, name: "DPO" },
  { id: 3, name: "Consent" },
  { id: 4, name: "Notices" },
  { id: 5, name: "Breach" },
  { id: 6, name: "Rights" },
  { id: 7, name: "Security" },
  { id: 8, name: "DPIA" },
  { id: 9, name: "Training" },
  { id: 10, name: "Monitoring" },
  { id: 11, name: "Third-Parties" },
  { id: 12, name: "Transfers" },
  { id: 13, name: "Maintenance" }
]

const dataLoader = new DataLoader(async (ids) => {
  return ids.map(id =>
    data.find((x) => x.id === id),
  );
});

module.exports = {
  findAll: function () {
    return data
  },
  findById: function (id) {
    return dataLoader.load(id)
  },
  sync: function () {
  }
}