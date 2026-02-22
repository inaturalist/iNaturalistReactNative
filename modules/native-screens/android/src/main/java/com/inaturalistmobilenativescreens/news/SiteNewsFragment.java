package com.inaturalistmobilenativescreens.news;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.ListView;
import android.widget.ProgressBar;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import com.inaturalistmobilenativescreens.R;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.os.Bundle;
import androidx.core.content.ContextCompat;
import androidx.viewpager.widget.PagerAdapter;
import androidx.viewpager.widget.ViewPager;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ListView;
import android.widget.ProgressBar;
import android.widget.TextView;

import com.handmark.pulltorefresh.library.PullToRefreshBase;
import com.handmark.pulltorefresh.library.PullToRefreshListView;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;

/**
 * Fragment that displays the news list. Inflates R.layout.news_list and wires
 * the list, pull-to-refresh, loading, and empty state. Logic can be moved here
 * from the existing BaseFragmentActivity (adapter, API, etc.).
 */
public class SiteNewsFragment extends Fragment {

    private ProgressBar mLoadingNews;
    private TextView mNewsEmpty;
    private PullToRefreshListView mNewsList;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater,
                             @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.news_list, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        // News (site/project news)
        mLoadingNews = (ProgressBar) view.findViewById(R.id.loading);
        mNewsEmpty = (TextView) view.findViewById(R.id.empty);
        mNewsEmpty.setText(R.string.no_news_yet);
        mNewsList = (PullToRefreshListView) view.findViewById(R.id.list);
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        mNewsList = null;
        mLoadingNews = null;
        mNewsEmpty = null;
    }
}
