export function unique (arr, key) {
  var output = []
  var usedKeys = {}
  for (var i = 0; i < arr.length; i++) {
    if (!usedKeys[arr[i][key]]) {
      usedKeys[arr[i][key]] = true
      output.push(arr[i])
    }
  }
  return output
}