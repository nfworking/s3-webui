export class MinIOError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public resource?: string,
  ) {
    super(message)
    this.name = "MinIOError"
  }
}

export function handleMinIOError(error: unknown): MinIOError {
  if (error instanceof MinIOError) {
    return error
  }

  if (error instanceof Error) {
    // Parse common MinIO error patterns
    const message = error.message.toLowerCase()

    if (message.includes("network") || message.includes("connection")) {
      return new MinIOError("Network connection failed. Please check your MinIO server connection.", "NETWORK_ERROR", 0)
    }

    if (message.includes("access denied") || message.includes("forbidden")) {
      return new MinIOError("Access denied. Please check your credentials and permissions.", "ACCESS_DENIED", 403)
    }

    if (message.includes("bucket") && message.includes("not found")) {
      return new MinIOError("The specified bucket does not exist.", "BUCKET_NOT_FOUND", 404)
    }

    if (message.includes("object") && message.includes("not found")) {
      return new MinIOError("The specified file does not exist.", "OBJECT_NOT_FOUND", 404)
    }

    if (message.includes("bucket") && message.includes("already exists")) {
      return new MinIOError("A bucket with this name already exists.", "BUCKET_EXISTS", 409)
    }

    if (message.includes("invalid bucket name")) {
      return new MinIOError(
        "Invalid bucket name. Please use lowercase letters, numbers, dots, and hyphens only.",
        "INVALID_BUCKET_NAME",
        400,
      )
    }

    if (message.includes("timeout")) {
      return new MinIOError("Operation timed out. Please try again.", "TIMEOUT", 408)
    }

    // Return original error message if no pattern matches
    return new MinIOError(error.message, "UNKNOWN_ERROR")
  }

  return new MinIOError("An unknown error occurred.", "UNKNOWN_ERROR")
}

export function getErrorMessage(error: unknown): string {
  const minioError = handleMinIOError(error)
  return minioError.message
}

export function isRetryableError(error: unknown): boolean {
  const minioError = handleMinIOError(error)
  const retryableCodes = ["NETWORK_ERROR", "TIMEOUT", "UNKNOWN_ERROR"]
  return retryableCodes.includes(minioError.code || "")
}
