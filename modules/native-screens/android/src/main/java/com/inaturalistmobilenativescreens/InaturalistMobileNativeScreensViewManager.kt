package com.inaturalistmobilenativescreens

import androidx.fragment.app.FragmentActivity
import androidx.fragment.app.FragmentManager
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.InaturalistMobileNativeScreensViewManagerInterface
import com.facebook.react.viewmanagers.InaturalistMobileNativeScreensViewManagerDelegate

@ReactModule(name = InaturalistMobileNativeScreensViewManager.NAME)
class InaturalistMobileNativeScreensViewManager : SimpleViewManager<InaturalistMobileNativeScreensView>(),
  InaturalistMobileNativeScreensViewManagerInterface<InaturalistMobileNativeScreensView> {
  private val mDelegate: ViewManagerDelegate<InaturalistMobileNativeScreensView>

  init {
    mDelegate = InaturalistMobileNativeScreensViewManagerDelegate(this)
  }

  override fun getDelegate(): ViewManagerDelegate<InaturalistMobileNativeScreensView>? {
    return mDelegate
  }

  override fun getName(): String {
    return NAME
  }

  public override fun createViewInstance(context: ThemedReactContext): InaturalistMobileNativeScreensView {
    return InaturalistMobileNativeScreensView(context)
  }

  override fun onDropViewInstance(view: InaturalistMobileNativeScreensView) {
    val reactContext = view.context as? ThemedReactContext ?: return
    val activity = reactContext.currentActivity as? FragmentActivity ?: return
    val fragmentManager: FragmentManager = activity.supportFragmentManager
    val fragment = fragmentManager.findFragmentByTag(InaturalistMobileNativeScreensView.SITE_NEWS_FRAGMENT_TAG_PREFIX + view.id)
    if (fragment != null) {
      fragmentManager.beginTransaction().remove(fragment).commitAllowingStateLoss()
    }
    super.onDropViewInstance(view)
  }

  companion object {
    const val NAME = "InaturalistMobileNativeScreensView"
  }
}
