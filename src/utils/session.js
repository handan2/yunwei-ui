class session {
  static setItem(key, value) {
    sessionStorage.setItem(key, JSON.stringify(value))
  }

  static getItem(key) {
    return JSON.parse(sessionStorage.getItem(key))
  }
}

export { session }
