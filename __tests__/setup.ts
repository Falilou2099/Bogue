// Polyfills pour Node.js
const { TextEncoder, TextDecoder } = require('node:util')
const { ReadableStream, TransformStream } = require('node:stream/web')
const { MessageChannel, MessagePort } = require('node:worker_threads')

// Définir tous les polyfills nécessaires AVANT d'importer undici
globalThis.TextEncoder = TextEncoder
globalThis.TextDecoder = TextDecoder
globalThis.ReadableStream = ReadableStream
globalThis.TransformStream = TransformStream
globalThis.MessageChannel = MessageChannel
globalThis.MessagePort = MessagePort

// Maintenant on peut importer undici
const { fetch, Request, Response, Headers, FormData } = require('undici')

// Polyfill fetch API pour les tests
globalThis.fetch = fetch
globalThis.Request = Request
globalThis.Response = Response
globalThis.Headers = Headers
globalThis.FormData = FormData
