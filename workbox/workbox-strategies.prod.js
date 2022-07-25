;(this.workbox = this.workbox || {}),
  (this.workbox.strategies = (function (t, e, s, r, a, n, i, o, c) {
    'use strict'
    function h() {
      return (h =
        Object.assign ||
        function (t) {
          for (var e = 1; e < arguments.length; e++) {
            var s = arguments[e]
            for (var r in s)
              Object.prototype.hasOwnProperty.call(s, r) && (t[r] = s[r])
          }
          return t
        }).apply(this, arguments)
    }
    try {
      self['workbox:strategies:6.1.5'] && _()
    } catch (t) {}
    function l(t) {
      return 'string' == typeof t ? new Request(t) : t
    }
    class u {
      constructor(t, e) {
        ;(this.vt = {}),
          Object.assign(this, e),
          (this.event = e.event),
          (this.ht = t),
          (this.bt = new a.Deferred()),
          (this._t = []),
          (this.kt = [...t.plugins]),
          (this.xt = new Map())
        for (const t of this.kt) this.xt.set(t, {})
        this.event.waitUntil(this.bt.promise)
      }
      async fetch(t) {
        const { event: s } = this
        let r = l(t)
        if (
          'navigate' === r.mode &&
          s instanceof FetchEvent &&
          s.preloadResponse
        ) {
          const t = await s.preloadResponse
          if (t) return t
        }
        const a = this.hasCallback('fetchDidFail') ? r.clone() : null
        try {
          for (const t of this.iterateCallbacks('requestWillFetch'))
            r = await t({ request: r.clone(), event: s })
        } catch (t) {
          throw new e.WorkboxError('plugin-error-request-will-fetch', {
            thrownError: t,
          })
        }
        const n = r.clone()
        try {
          let t
          t = await fetch(
            r,
            'navigate' === r.mode ? void 0 : this.ht.fetchOptions,
          )
          for (const e of this.iterateCallbacks('fetchDidSucceed'))
            t = await e({ event: s, request: n, response: t })
          return t
        } catch (t) {
          throw (
            (a &&
              (await this.runCallbacks('fetchDidFail', {
                error: t,
                event: s,
                originalRequest: a.clone(),
                request: n.clone(),
              })),
            t)
          )
        }
      }
      async fetchAndCachePut(t) {
        const e = await this.fetch(t),
          s = e.clone()
        return this.waitUntil(this.cachePut(t, s)), e
      }
      async cacheMatch(t) {
        const e = l(t)
        let s
        const { cacheName: r, matchOptions: a } = this.ht,
          n = await this.getCacheKey(e, 'read'),
          i = h({}, a, { cacheName: r })
        s = await caches.match(n, i)
        for (const t of this.iterateCallbacks('cachedResponseWillBeUsed'))
          s =
            (await t({
              cacheName: r,
              matchOptions: a,
              cachedResponse: s,
              request: n,
              event: this.event,
            })) || void 0
        return s
      }
      async cachePut(t, s) {
        const a = l(t)
        await c.timeout(0)
        const o = await this.getCacheKey(a, 'write')
        if (!s)
          throw new e.WorkboxError('cache-put-with-no-response', {
            url: i.getFriendlyURL(o.url),
          })
        const h = await this.Rt(s)
        if (!h) return !1
        const { cacheName: u, matchOptions: w } = this.ht,
          f = await self.caches.open(u),
          d = this.hasCallback('cacheDidUpdate'),
          p = d
            ? await r.cacheMatchIgnoreParams(
                f,
                o.clone(),
                ['__WB_REVISION__'],
                w,
              )
            : null
        try {
          await f.put(o, d ? h.clone() : h)
        } catch (t) {
          throw (
            ('QuotaExceededError' === t.name &&
              (await n.executeQuotaErrorCallbacks()),
            t)
          )
        }
        for (const t of this.iterateCallbacks('cacheDidUpdate'))
          await t({
            cacheName: u,
            oldResponse: p,
            newResponse: h.clone(),
            request: o,
            event: this.event,
          })
        return !0
      }
      async getCacheKey(t, e) {
        if (!this.vt[e]) {
          let s = t
          for (const t of this.iterateCallbacks('cacheKeyWillBeUsed'))
            s = l(
              await t({
                mode: e,
                request: s,
                event: this.event,
                params: this.params,
              }),
            )
          this.vt[e] = s
        }
        return this.vt[e]
      }
      hasCallback(t) {
        for (const e of this.ht.plugins) if (t in e) return !0
        return !1
      }
      async runCallbacks(t, e) {
        for (const s of this.iterateCallbacks(t)) await s(e)
      }
      *iterateCallbacks(t) {
        for (const e of this.ht.plugins)
          if ('function' == typeof e[t]) {
            const s = this.xt.get(e),
              r = (r) => {
                const a = h({}, r, { state: s })
                return e[t](a)
              }
            yield r
          }
      }
      waitUntil(t) {
        return this._t.push(t), t
      }
      async doneWaiting() {
        let t
        for (; (t = this._t.shift()); ) await t
      }
      destroy() {
        this.bt.resolve()
      }
      async Rt(t) {
        let e = t,
          s = !1
        for (const t of this.iterateCallbacks('cacheWillUpdate'))
          if (
            ((e =
              (await t({
                request: this.request,
                response: e,
                event: this.event,
              })) || void 0),
            (s = !0),
            !e)
          )
            break
        return s || (e && 200 !== e.status && (e = void 0)), e
      }
    }
    class w {
      constructor(t = {}) {
        ;(this.cacheName = s.cacheNames.getRuntimeName(t.cacheName)),
          (this.plugins = t.plugins || []),
          (this.fetchOptions = t.fetchOptions),
          (this.matchOptions = t.matchOptions)
      }
      handle(t) {
        const [e] = this.handleAll(t)
        return e
      }
      handleAll(t) {
        t instanceof FetchEvent && (t = { event: t, request: t.request })
        const e = t.event,
          s = 'string' == typeof t.request ? new Request(t.request) : t.request,
          r = 'params' in t ? t.params : void 0,
          a = new u(this, { event: e, request: s, params: r }),
          n = this.Wt(a, s, e)
        return [n, this.Ut(n, a, s, e)]
      }
      async Wt(t, s, r) {
        let a
        await t.runCallbacks('handlerWillStart', { event: r, request: s })
        try {
          if (((a = await this._handle(s, t)), !a || 'error' === a.type))
            throw new e.WorkboxError('no-response', { url: s.url })
        } catch (e) {
          for (const n of t.iterateCallbacks('handlerDidError'))
            if (((a = await n({ error: e, event: r, request: s })), a)) break
          if (!a) throw e
        }
        for (const e of t.iterateCallbacks('handlerWillRespond'))
          a = await e({ event: r, request: s, response: a })
        return a
      }
      async Ut(t, e, s, r) {
        let a, n
        try {
          a = await t
        } catch (n) {}
        try {
          await e.runCallbacks('handlerDidRespond', {
            event: r,
            request: s,
            response: a,
          }),
            await e.doneWaiting()
        } catch (t) {
          n = t
        }
        if (
          (await e.runCallbacks('handlerDidComplete', {
            event: r,
            request: s,
            response: a,
            error: n,
          }),
          e.destroy(),
          n)
        )
          throw n
      }
    }
    const f = {
      cacheWillUpdate: async ({ response: t }) =>
        200 === t.status || 0 === t.status ? t : null,
    }
    return (
      (t.CacheFirst = class extends w {
        async _handle(t, s) {
          let r,
            a = await s.cacheMatch(t)
          if (!a)
            try {
              a = await s.fetchAndCachePut(t)
            } catch (t) {
              r = t
            }
          if (!a)
            throw new e.WorkboxError('no-response', { url: t.url, error: r })
          return a
        }
      }),
      (t.CacheOnly = class extends w {
        async _handle(t, s) {
          const r = await s.cacheMatch(t)
          if (!r) throw new e.WorkboxError('no-response', { url: t.url })
          return r
        }
      }),
      (t.NetworkFirst = class extends w {
        constructor(t = {}) {
          super(t),
            this.plugins.some((t) => 'cacheWillUpdate' in t) ||
              this.plugins.unshift(f),
            (this.Ct = t.networkTimeoutSeconds || 0)
        }
        async _handle(t, s) {
          const r = [],
            a = []
          let n
          if (this.Ct) {
            const { id: e, promise: i } = this.Dt({
              request: t,
              logs: r,
              handler: s,
            })
            ;(n = e), a.push(i)
          }
          const i = this.Et({ timeoutId: n, request: t, logs: r, handler: s })
          a.push(i)
          const o = await s.waitUntil(
            (async () => (await s.waitUntil(Promise.race(a))) || (await i))(),
          )
          if (!o) throw new e.WorkboxError('no-response', { url: t.url })
          return o
        }
        Dt({ request: t, logs: e, handler: s }) {
          let r
          return {
            promise: new Promise((e) => {
              r = setTimeout(async () => {
                e(await s.cacheMatch(t))
              }, 1e3 * this.Ct)
            }),
            id: r,
          }
        }
        async Et({ timeoutId: t, request: e, logs: s, handler: r }) {
          let a, n
          try {
            n = await r.fetchAndCachePut(e)
          } catch (t) {
            a = t
          }
          return (
            t && clearTimeout(t), (!a && n) || (n = await r.cacheMatch(e)), n
          )
        }
      }),
      (t.NetworkOnly = class extends w {
        constructor(t = {}) {
          super(t), (this.Ct = t.networkTimeoutSeconds || 0)
        }
        async _handle(t, s) {
          let r, a
          try {
            const e = [s.fetch(t)]
            if (this.Ct) {
              const t = c.timeout(1e3 * this.Ct)
              e.push(t)
            }
            if (((a = await Promise.race(e)), !a))
              throw new Error(
                `Timed out the network response after ${this.Ct} seconds.`,
              )
          } catch (t) {
            r = t
          }
          if (!a)
            throw new e.WorkboxError('no-response', { url: t.url, error: r })
          return a
        }
      }),
      (t.StaleWhileRevalidate = class extends w {
        constructor(t) {
          super(t),
            this.plugins.some((t) => 'cacheWillUpdate' in t) ||
              this.plugins.unshift(f)
        }
        async _handle(t, s) {
          const r = s.fetchAndCachePut(t).catch(() => {})
          let a,
            n = await s.cacheMatch(t)
          if (n);
          else
            try {
              n = await r
            } catch (t) {
              a = t
            }
          if (!n)
            throw new e.WorkboxError('no-response', { url: t.url, error: a })
          return n
        }
      }),
      (t.Strategy = w),
      (t.StrategyHandler = u),
      t
    )
  })(
    {},
    workbox.core._private,
    workbox.core._private,
    workbox.core._private,
    workbox.core._private,
    workbox.core._private,
    workbox.core._private,
    workbox.core._private,
    workbox.core._private,
  ))
//# sourceMappingURL=workbox-strategies.prod.js.map
