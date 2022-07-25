//缓存空间名称
const CACHE_VERSION = 'sw_v' + 1
//需缓存的文件
const CACHE_FILES = ['/music-ease/', '/music-ease/index.html']
// fetch缓存文件
const FETCH_CACHE_FILES = ['js', 'css', 'jpg']

const hasSaving = function (url) {
  for (var file of FETCH_CACHE_FILES) {
    if (new URL(url).pathname.endsWith(file)) return true
  }
  return false
}
// const pageFallback = 'offline.html'

self.addEventListener('install', function (event) {
  // const files = [pageFallback]
  self.skipWaiting()
  // event.waitUntil(
  //   self.caches
  //     .open('workbox-offline-fallbacks')
  //     .then((cache) => cache.addAll(files)),
  // )
})
//监听激活事件
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then((keys) => {
      const promises = keys.map((key, i) => {
        if (key !== CACHE_VERSION) {
          return caches.delete(keys[i])
        }
      })
      return Promise.all(promises)
    }),
  )
})

self.addEventListener('fetch', function (event) {
  if (event.request.url.endsWith('mp3')) return
  event.respondWith(
    caches.match(event.request).then((resp) => {
      return (
        resp ||
        fetch(event.request)
          .then((response) => {
            const url = event.request.url
            if (!hasSaving(url)) return response
            return caches.open(CACHE_VERSION).then((cache) => {
              cache
                .put(event.request, response.clone())
                .catch((err) => console.log('err :>> ', err))
              return response
            })
          })
          .catch((err) => console.log('err :>> ', err))
      )
    }),
  )
})
self.addEventListener('message', (event) => {
  console.log('receive message' + event.data)
  var url = event.data
  console.log('update root file ' + url)
  event.waitUntil(
    caches.open(CACHE_VERSION).then(async (cache) => {
      const res = await fetch(url)
      cache.put(url, res)
    }),
  )
})

// if (location.href.includes('/Dashboard')) {
//   importScripts(
//     'https://cdn.jsdelivr.net/npm/workbox-cdn/workbox/workbox-sw.js',
//   )
//   workbox.setConfig({
//     debug: false,
//   })
//   console.log('sw.js is load by CDN!')
// } else {
//   importScripts('./workbox/workbox-sw.js')
//   workbox.setConfig({
//     debug: false,
//     modulePathPrefix: './workbox/',
//   })
//   importScripts('./workbox/workbox-strategies.prod.js')
//   importScripts('./workbox/workbox-recipes.prod.js')
//   // console.log(workbox.recipes)
//   workbox.recipes.pageCache()
//   workbox.recipes.offlineFallback()

//   console.log('sw.js is load by local!')
// }
// // Cache html/video.
// workbox.routing.registerRoute(
//   ({ request }) =>
//     request.destination === 'document' || request.destination === 'video',
//   new workbox.strategies.NetworkFirst({
//     cacheName: 'html-video',
//   }),
// )
// // Cache css/js/font.
// workbox.routing.registerRoute(
//   ({ request }) =>
//     request.destination === 'style' ||
//     request.destination === 'script' ||
//     request.destination === 'font',
//   new workbox.strategies.CacheFirst({
//     cacheName: 'css-js-font',
//     plugins: [
//       new workbox.cacheableResponse.CacheableResponsePlugin({
//         statuses: [200],
//       }),
//       new workbox.expiration.ExpirationPlugin({
//         maxEntries: 50,
//         maxAgeSeconds: 60 * 60 * 24 * 7, // 7 Days
//       }),
//     ],
//   }),
// )

// // Cache image.
// workbox.routing.registerRoute(
//   ({ request }) => request.destination === 'image',
//   new workbox.strategies.StaleWhileRevalidate({
//     cacheName: 'image',
//     plugins: [
//       new workbox.cacheableResponse.CacheableResponsePlugin({
//         statuses: [200],
//       }),
//       new workbox.expiration.ExpirationPlugin({
//         maxEntries: 50,
//         maxAgeSeconds: 60 * 60 * 24 * 7, // 7 Days
//       }),
//     ],
//   }),
// )
// // const pageFallback = 'offline.html'
// // const imageFallback = false
// // const fontFallback = false

// // workbox.setDefaultHandler(new workbox.strategies.NetworkOnly())

// // self.addEventListener('install', (event) => {
// //   const files = [pageFallback]
// //   if (imageFallback) {
// //     files.push(imageFallback)
// //   }
// //   if (fontFallback) {
// //     files.push(fontFallback)
// //   }

// //   event.waitUntil(
// //     self.caches
// //       .open('workbox-offline-fallbacks')
// //       .then((cache) => cache.addAll(files)),
// //   )
// // })

// // const handler = async (options) => {
// //   const dest = options.request.destination
// //   const cache = await self.caches.open('workbox-offline-fallbacks')

// //   if (dest === 'document') {
// //     return (await cache.match(pageFallback)) || Response.error()
// //   }

// //   if (dest === 'image' && imageFallback !== false) {
// //     return (await cache.match(imageFallback)) || Response.error()
// //   }

// //   if (dest === 'font' && fontFallback !== false) {
// //     return (await cache.match(fontFallback)) || Response.error()
// //   }

// //   return Response.error()
// // }

// // setCatchHandler(handler)
