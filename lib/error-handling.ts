export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof AppError) {
    return {
      error: error.message,
      code: error.code,
      status: error.statusCode,
    }
  }

  console.error('Unexpected error:', error)
  return {
    error: 'Произошла непредвиденная ошибка',
    status: 500,
  }
} 