const data = [
  { id: 1, userId: 2,  regulationId: 1, controlStatusId: 1, controlInPlaceId: 1, riskId: 1, comments: ""},
  { id: 2, userId: 2,  regulationId: 2, controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 3, userId: 2,  regulationId: 3, controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 4, userId: 2,  regulationId: 4, controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 5, userId: 2,  regulationId: 5, controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 6, userId: 2,  regulationId: 6, controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 7, userId: 2,  regulationId: 7, controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 8, userId: 2,  regulationId: 8, controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 9, userId: 2,  regulationId: 9, controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 10, userId: 2,  regulationId: 10, controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 11, userId: 2,  regulationId: 11, controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 12, userId: 2,  regulationId: 12, controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 13, userId: 2,  regulationId: 13, controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},

  { id: 1, userId: 3,  regulationId: 1, controlStatusId: 1, controlInPlaceId: 1, riskId: 1, comments: ""},
  { id: 2, userId: 3,  regulationId: 2, controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 3, userId: 3,  regulationId: 3, controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 4, userId: 3,  regulationId: 4, controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 5, userId: 3,  regulationId: 5, controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 6, userId: 3,  regulationId: 6, controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 7, userId: 3,  regulationId: 7, controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
  { id: 8, userId: 3,  regulationId: 8, controlStatusId: 1, controlInPlaceId: 1,riskId: 1, comments: ""},
]

var nextId = 100

module.exports = {
  findAllByUserId: function (userId) {
    return data.filter(x => x.userId === userId)
  },
  findOne: function (userId, regulationId) {
    return data.find(x => x.userId === userId && x.regulationId === regulationId)
  },
  add(user) {
    data.push(Object.assign({id: ++nextId}, user))
  },
  sync: function () {
  }
}