package org.inaturalist.iNaturalistMobile

import android.content.Context
import com.facebook.react.modules.network.CustomClientBuilder
import java.io.File
import okhttp3.OkHttpClient
import okhttp3.RequestBody.Companion.asRequestBody
import okio.buffer
import okio.sink

/**
 * RN streams multipart file parts from an InputStream it closes after one
 * write, so OkHttp can't resend the body. The production API closes idle
 * connections after as little as ~2s, while OkHttp only health-checks
 * connections idle for 10s or more, so uploads that reuse a dead connection
 * fail with "Stream Closed" (surfaced to JS as "Network request failed")
 * instead of being silently resent on a new connection like JSON requests.
 * Spooling multipart bodies to a file first lets OkHttp resend them.
 *
 * NetworkingModule applies this to a fresh builder for every fetch/XHR request.
 */
class ResendableUploadClientBuilder(context: Context) : CustomClientBuilder {
  private val spoolDir = File(context.cacheDir, "upload-bodies").apply { deleteRecursively() }

  override fun apply(builder: OkHttpClient.Builder) {
    builder.addInterceptor { chain ->
      val request = chain.request()
      val body = request.body
      if (body?.contentType()?.type != "multipart") {
        return@addInterceptor chain.proceed(request)
      }
      spoolDir.mkdirs()
      if (body.contentLength() > spoolDir.usableSpace) {
        return@addInterceptor chain.proceed(request)
      }
      val spooled = File.createTempFile("body", null, spoolDir)
      try {
        spooled.sink().buffer().use { body.writeTo(it) }
        val resendable = spooled.asRequestBody(body.contentType())
        chain.proceed(request.newBuilder().method(request.method, resendable).build())
      } finally {
        spooled.delete()
      }
    }
  }
}
