class ApiError extends Error {
  constructor(
    statusCode = 500,
    message = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    super(message); // overwrite
    this.statusCode = statusCode; // add statusCode
    this.data = null; // remove default "data"
    this.message = message; // add message
    this.success = false;
    this.errors = errors;

    if (stack) this.stack = stack;
    else Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
