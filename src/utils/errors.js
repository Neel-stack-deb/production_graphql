export class AppError extends Error {
  constructor(message, statusCode = 500, code = "INTERNAL_SERVER_ERROR") {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function formatGraphQLError(formattedError, error) {
  const originalError = error.originalError;
  if (originalError instanceof AppError) {
    return {
      ...formattedError,
      message: originalError.message,
      extensions: {
        ...formattedError.extensions,
        code: originalError.code,
        statusCode: originalError.statusCode,
      },
    };
  }

  return formattedError;
}