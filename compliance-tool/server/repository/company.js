const data = [
  { id: 1, name: "Corp1", companyId: 1 },
  { id: 2, name: "Corp2", companyId: 2 }
]

let companyId = 100

module.exports = {
  findAll: function () {
    return data
  },
  findById: function (id) {
    return data.find(x => x.id === id);
  },
  add: function(company) {
    company.id = ++companyId
    data.push(company)
  },
  delete: function(id) {
    
  },
  sync: function () {
  }
}