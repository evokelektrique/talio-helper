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

   // serialize() {
   //    return {
   //       message: this.message,
   //       name: this.name
   //    }
   // }
}

class UnsupportedBrowserError extends Error {
   constructor(message) {
      super(message)
      this.name = "UnsupportedBrowserError"
      super.display()
   }
}

class NotFoundError extends Error {
   constructor(message) {
      super(message)
      this.name = "NotFoundError"
      super.display()
   }
}

export { Error, UnsupportedBrowserError, NotFoundError }
