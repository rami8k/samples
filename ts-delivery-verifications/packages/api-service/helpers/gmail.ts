export function getMessageSubject(message) {
  const subjectHeader = message.payload.headers.find(x => x.name === 'Subject')
  return subjectHeader.value
}