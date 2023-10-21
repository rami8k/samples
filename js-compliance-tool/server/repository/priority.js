const data = [
  { id: 1, name: 'low' }, 
  { id: 2, name: 'moderate'}
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