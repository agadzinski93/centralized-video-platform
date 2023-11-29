class AppError extends Error {
  constructor(status, msg) {
    super();
    this.message = msg || "Something went wrong";
    this.status = status || 500;
  }
};
export {AppError};