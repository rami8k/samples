import DataLoader from 'dataloader'

const data = [
  { id: 1, name: "N/A" },
  { id: 2, name: "Effective" },
  { id: 3, name: "Partially Effective" },
  { id: 4, name: "Open" }
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