import { URL } from 'url'

export class UrlUtil {
  static removeSearchParams(url: string): string {
    const parsed = new URL(url)
    parsed.search = ''

    return parsed.toString()
  }
}