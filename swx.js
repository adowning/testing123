if (location.href.includes('/Dashboard')) {
  importScripts(
    'https://cdn.jsdelivr.net/npm/workbox-cdn/workbox/workbox-sw.js',
  )
  workbox.setConfig({
    debug: false,
  })
  console.log('sw.js is load by CDN!')
} else {
  importScripts('./workbox/workbox-sw.js')
  workbox.setConfig({
    debug: false,
    modulePathPrefix: './workbox/',
  })
  console.log('sw.js is load by local!')
}
// Cache html/video.
workbox.routing.registerRoute(
  ({ request }) =>
    request.destination === 'document' || request.destination === 'video',
  new workbox.strategies.NetworkFirst({
    cacheName: 'html-video',
  }),
)
// Cache css/js/font.
workbox.routing.registerRoute(
  ({ request }) =>
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font',
  new workbox.strategies.CacheFirst({
    cacheName: 'css-js-font',
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [200],
      }),
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 7, // 7 Days
      }),
    ],
  }),
)

// Cache image.
workbox.routing.registerRoute(
  ({ request }) => request.destination === 'image',
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'image',
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [200],
      }),
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 7, // 7 Days
      }),
    ],
  }),
)
const pageFallback = 'offline.html'
const imageFallback = false
const fontFallback = false
importScripts('./workbox/workbox-sw.js')

setDefaultHandler(new NetworkOnly())

self.addEventListener('install', (event) => {
  const files = [pageFallback]
  if (imageFallback) {
    files.push(imageFallback)
  }
  if (fontFallback) {
    files.push(fontFallback)
  }

  event.waitUntil(
    self.caches
      .open('workbox-offline-fallbacks')
      .then((cache) => cache.addAll(files)),
  )
})

const handler = async (options) => {
  const dest = options.request.destination
  const cache = await self.caches.open('workbox-offline-fallbacks')

  if (dest === 'document') {
    return (await cache.match(pageFallback)) || Response.error()
  }

  if (dest === 'image' && imageFallback !== false) {
    return (await cache.match(imageFallback)) || Response.error()
  }

  if (dest === 'font' && fontFallback !== false) {
    return (await cache.match(fontFallback)) || Response.error()
  }

  return Response.error()
}

setCatchHandler(handler)
