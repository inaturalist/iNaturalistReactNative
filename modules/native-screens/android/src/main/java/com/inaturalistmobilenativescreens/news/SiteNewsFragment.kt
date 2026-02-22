package com.inaturalistmobilenativescreens.news

import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.ListView
import android.widget.ProgressBar
import android.widget.TextView
import androidx.fragment.app.Fragment
import com.handmark.pulltorefresh.library.PullToRefreshBase
import com.handmark.pulltorefresh.library.PullToRefreshListView
import com.inaturalistmobilenativescreens.R

/**
 * Fragment that displays the news list. Inflates [R.layout.news_list] and wires
 * the list, pull-to-refresh, loading, and empty state. Logic can be moved here
 * from the existing BaseFragmentActivity (adapter, API, etc.).
 */
class SiteNewsFragment : Fragment() {

    private var mNewsList: PullToRefreshListView? = null
    private var mLoadingNews: ProgressBar? = null
    private var mNewsEmpty: TextView? = null

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.news_list, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        mLoadingNews = view.findViewById(R.id.loading)
        mNewsEmpty = view.findViewById(R.id.empty)
        mNewsEmpty?.setText(R.string.no_news_yet)
        mNewsList = view.findViewById(R.id.list)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        mNewsList = null
        mLoadingNews = null
        mNewsEmpty = null
    }
}
