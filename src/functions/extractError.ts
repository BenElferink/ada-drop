import { safeJsonParse } from '@odigos/ui-kit/functions'

export interface ExtractedError {
  statusCode: number
  message: string
}

export const extractError = (error: any): ExtractedError => {
  if (error?.response) {
    return {
      statusCode: error.response.status,
      message: error.response.data.message,
    }
  }

  let message = error?.message || error?.toString() || 'unknown error'

  if (message.indexOf('[') === 0 && message.indexOf(':') !== -1) {
    // Mesh.js error
    const splitted = message.split(':')
    splitted.shift()

    message = splitted.join(':').trim()
    if (message.charAt(message.length - 1) === '.') {
      message = message.slice(0, -1)
    }

    message = safeJsonParse(message, { info: message }).info
  }

  return {
    statusCode: 500,
    message,
  }
}
