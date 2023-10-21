const data = [
  { id: 1, name: "Admin" },
  { id: 2, name: "Corporate Admin" },
  { id: 3, name: "Corporate User" }
]

module.exports = {
  findAll: function () {
    return data
  },
  findById: function (id) {
    return data.find(x => x.id === id);
  },
  sync: function () {
  }
}