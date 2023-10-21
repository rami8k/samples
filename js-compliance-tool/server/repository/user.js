const data = [
  { id: 1, companyId: 1, firstName: "user1", lastName: "K", email: 'user1@corp1.com', password: 'test', roles: ['admin'] },
  { id: 2, companyId: 2, firstName: "user2", lastName: "K1", email: 'user2@corp1.com', password: 'test', roles: ['user'] },
  { id: 3, companyId: 2, firstName: "user3", lastName: "K2", email: 'user3@corp2.com', password: 'test', roles: ['user'] }
]

module.exports = {
  findAll: function () {
    return data
  },
  findById: function (id) {
    return data.find(x => x.id === id);
  },
  findByEmail: function (email) {
    return data.find(x => x.email === email);
  },
  findByCompanyId: function (companyId) {
    return data.find(x => x.companyId === companyId);
  },
  sync: function () {
  }
}