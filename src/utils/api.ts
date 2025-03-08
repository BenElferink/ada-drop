/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios'
import type { EpochResponse } from '@/pages/api/epoch'

class Api {
  baseUrl: string

  constructor() {
    this.baseUrl = '/api'
  }

  private getQueryStringFromQueryOptions = (options: Record<string, any> = {}): string => {
    const query = Object.entries(options)
      .filter(([key, val]) => key && val)
      .map(([key, cal]) => `&${key.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`)}=${cal}`)
      .join('')

    return query ? `?${query.slice(1)}` : ''
  }

  private handleError = async (error: any, reject: (reason: string) => void, retry: () => Promise<any>): Promise<any> => {
    console.error(error)

    if ([400, 404, 500, 504].includes(error?.response?.status)) {
      return reject(error?.response?.data || error?.message || 'UNKNOWN ERROR')
    } else {
      return await retry()
    }
  }

  epoch = {
    getData: (): Promise<EpochResponse> => {
      const uri = `${this.baseUrl}/epoch`

      return new Promise(async (resolve, reject) => {
        try {
          const { data } = await axios.get<EpochResponse>(uri)

          return resolve(data)
        } catch (error) {
          return await this.handleError(error, reject, async () => await this.epoch.getData())
        }
      })
    },
  }
}

const api = new Api()

export default api
