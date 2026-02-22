package com.inaturalistmobilenativescreens

import android.content.Context
import android.util.AttributeSet
import android.view.View
import androidx.fragment.app.FragmentActivity
import androidx.fragment.app.FragmentManager
import com.facebook.react.uimanager.ThemedReactContext
import com.inaturalistmobilenativescreens.news.SiteNewsFragment

class InaturalistMobileNativeScreensView : android.widget.FrameLayout {

    companion object {
        const val SITE_NEWS_FRAGMENT_TAG_PREFIX = "site_news_fragment_"
    }

    constructor(context: Context?) : super(context!!) {
        init()
    }

    constructor(context: Context?, attrs: AttributeSet?) : super(context!!, attrs) {
        init()
    }

    constructor(context: Context?, attrs: AttributeSet?, defStyleAttr: Int) : super(
        context!!,
        attrs,
        defStyleAttr
    ) {
        init()
    }

    private fun fragmentTag(): String = "$SITE_NEWS_FRAGMENT_TAG_PREFIX$id"

    private fun init() {
        if (id == View.NO_ID) {
            id = View.generateViewId()
        }
    }

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        addSiteNewsFragmentIfNeeded()
    }

    private fun addSiteNewsFragmentIfNeeded() {
        val reactContext = context as? ThemedReactContext ?: return
        val activity = reactContext.currentActivity as? FragmentActivity ?: return
        val fragmentManager: FragmentManager = activity.supportFragmentManager
        if (fragmentManager.findFragmentByTag(fragmentTag()) != null) return
        fragmentManager
            .beginTransaction()
            .replace(id, SiteNewsFragment(), fragmentTag())
            .commitAllowingStateLoss()
    }
}
