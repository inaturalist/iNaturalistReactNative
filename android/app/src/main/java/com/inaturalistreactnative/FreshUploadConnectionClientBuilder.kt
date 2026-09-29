package org.inaturalist.iNaturalistMobile

import com.facebook.react.modules.network.CustomClientBuilder
import okhttp3.ConnectionPool
import okhttp3.OkHttpClient
import okhttp3.RequestBody
import okio.BufferedSink

/**
 * RN streams multipart file parts from an InputStream it opens once, so OkHttp
 * can't replay the body when a pooled connection turns out to be dead. The
 * production API closes idle connections after as little as ~2s, while OkHttp
 * only health-checks connections idle for 10s or more, so uploads that reuse
 * a connection fail with "Stream Closed" (surfaced to JS as "Network request
 * failed"). Evicting idle connections before each multipart request makes it
 * open a fresh one; in-flight requests are unaffected. Marking the body
 * one-shot stops OkHttp from retrying once the body has started sending, so
 * the original error reaches JS, which retries with a fresh body.
 *
 * NetworkingModule applies this to a fresh builder for every fetch/XHR request,
 * so all of them share this one pool.
 */
class FreshUploadConnectionClientBuilder : CustomClientBuilder {
  private val connectionPool = ConnectionPool()

  override fun apply(builder: OkHttpClient.Builder) {
    builder
      .connectionPool(connectionPool)
      .addInterceptor { chain ->
        val request = chain.request()
        val body = request.body
        if (body?.contentType()?.type != "multipart") {
          return@addInterceptor chain.proceed(request)
        }
        connectionPool.evictAll()
        chain.proceed(request.newBuilder().method(request.method, OneShotRequestBody(body)).build())
      }
  }
}

private class OneShotRequestBody(private val delegate: RequestBody) : RequestBody() {
  override fun contentType() = delegate.contentType()

  override fun contentLength() = delegate.contentLength()

  override fun isOneShot() = true

  override fun writeTo(sink: BufferedSink) = delegate.writeTo(sink)
}
