import priorities from './priority.json'

export function getPriorityColor(priority) {
  return priority === '' ? '' : priorities.filter(x => x.name === priority)[0]
}

export function getPriority(controlInPlaceId, controlStatusId, riskId) {
  const priority = priorities.filter(x => x.controlInPlace.includes(controlInPlaceId) && x.controlStatus.includes(controlStatusId) && x.risk.includes(riskId))
  var test = priority.length > 0 ? priority[0] : priorities.filter(x => x.id === 0)
  return test
}

