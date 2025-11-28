// Polyfills pour Node.js
import { TextEncoder, TextDecoder } from 'util'
import { ReadableStream, TransformStream } from 'stream/web'

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder as any
global.ReadableStream = ReadableStream as any
global.TransformStream = TransformStream as any

// Mock Request et Response pour Next.js
if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    constructor(public url: string, public init?: RequestInit) {}
    json() { return Promise.resolve(this.init?.body ? JSON.parse(this.init.body as string) : {}) }
    text() { return Promise.resolve(this.init?.body as string || '') }
    headers = new Map()
  } as any
}

if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    constructor(public body: any, public init?: ResponseInit) {}
    json() { return Promise.resolve(this.body) }
    text() { return Promise.resolve(String(this.body)) }
  } as any
}
