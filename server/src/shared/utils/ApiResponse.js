class ApiResponse {
  constructor(statusCode, data = null, message = "Success") {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
  }

  static send(res, statusCode = 200, data = null, message = "Success") {
    return res
      .status(statusCode)
      .json(new ApiResponse(statusCode, data, message));
  }

  static ok(res, data = null, message = "Success") {
    return ApiResponse.send(res, 200, data, message);
  }

  static created(res, data = null, message = "Created successfully") {
    return ApiResponse.send(res, 201, data, message);
  }

  static noContent(res) {
    return res.status(204).end();
  }
}

export default ApiResponse;
