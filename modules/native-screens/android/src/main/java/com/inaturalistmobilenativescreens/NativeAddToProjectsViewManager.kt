package com.inaturalistmobilenativescreens

import android.graphics.Color
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.NativeAddToProjectsViewManagerInterface
import com.facebook.react.viewmanagers.NativeAddToProjectsViewManagerDelegate

@ReactModule(name = NativeAddToProjectsViewManager.NAME)
class NativeAddToProjectsViewManager : SimpleViewManager<NativeAddToProjectsView>(),
  NativeAddToProjectsViewManagerInterface<NativeAddToProjectsView> {
  private val mDelegate: ViewManagerDelegate<NativeAddToProjectsView>

  init {
    mDelegate = NativeAddToProjectsViewManagerDelegate(this)
  }

  override fun getDelegate(): ViewManagerDelegate<NativeAddToProjectsView>? {
    return mDelegate
  }

  override fun getName(): String {
    return NAME
  }

  public override fun createViewInstance(context: ThemedReactContext): NativeAddToProjectsView {
    return NativeAddToProjectsView(context)
  }

  @ReactProp(name = "color")
  override fun setColor(view: NativeAddToProjectsView?, color: Int?) {
    view?.setBackgroundColor(color ?: Color.TRANSPARENT)
  }

  companion object {
    const val NAME = "NativeAddToProjectsView"
  }
}
