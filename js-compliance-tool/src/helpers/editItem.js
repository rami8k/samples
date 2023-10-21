export function editItem (originalList, editedList, propertyKey, value, itemId) {
  var editedItem = editedList.find(x => x.id === itemId)

  if (typeof editedItem !== 'undefined') {
    editedItem[propertyKey] = typeof(editedItem[propertyKey])(value)
  } else {
    var originalItem = originalList.find(x => x.id === itemId)

    var newEditedItem = {
      id: originalItem.id 
    }

    newEditedItem[propertyKey] = (originalItem[propertyKey].constructor)(value)
    editedList.push(newEditedItem)
  }
}