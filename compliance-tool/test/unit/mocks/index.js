export function createLocalStorageMock() {
  // @see {@link: https://github.com/facebook/jest/issues/2098}
  let localStorageMock = (() => {
    let store = {}

    return {
      getItem(key) {
        return store[key] || null
      },
      setItem(key, value) {
        store[key] = value.toString()
      },
      clear() {
        for (const key in store) {
          delete store[key]
        }
      }
    }
  })()

  window.localStorage = localStorageMock

  return localStorageMock
}