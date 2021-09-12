
// 
// Error Classes
// 
class Error {
  constructor(message) {
    this.message = message
    this.name = "Error"
  }

  display() {
    console.log("Talio: " + "<" + this.name + "> " + this.message)
  }
}

class UnsupportedBrowserError extends Error {
  constructor(message) {
    super(message)
    this.name = "UnsupportedBrowserError"
    super.display()
  }
}

export { Error, UnsupportedBrowserError }