// Polyfills pour Node.js
const { TextEncoder, TextDecoder } = require('util')
const { ReadableStream, TransformStream } = require('stream/web')
const { MessageChannel, MessagePort } = require('worker_threads')

// Définir tous les polyfills nécessaires AVANT d'importer undici
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder
global.ReadableStream = ReadableStream
global.TransformStream = TransformStream
global.MessageChannel = MessageChannel
global.MessagePort = MessagePort

// Maintenant on peut importer undici
const { fetch, Request, Response, Headers, FormData } = require('undici')

// Polyfill fetch API pour les tests
global.fetch = fetch
global.Request = Request
global.Response = Response
global.Headers = Headers
global.FormData = FormData
