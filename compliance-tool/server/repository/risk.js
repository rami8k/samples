import DataLoader from 'dataloader'

const data = [
  { id: 1, name: "N/A" },
  { id: 2, name: "Critical" },
  { id: 3, name: "High" },
  { id: 4, name: "Moderate" },
  { id: 5, name: "Low" },
  { id: 6, name: "Very Low" }
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
