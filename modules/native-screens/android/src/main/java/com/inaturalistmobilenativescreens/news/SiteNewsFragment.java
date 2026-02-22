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
import com.handmark.pulltorefresh.library.PullToRefreshListView;
import com.inaturalistmobilenativescreens.R;

/**
 * Fragment that displays the news list. Inflates R.layout.news_list and wires
 * the list, pull-to-refresh, loading, and empty state. Logic can be moved here
 * from the existing BaseFragmentActivity (adapter, API, etc.).
 */
public class SiteNewsFragment extends Fragment {

    private PullToRefreshListView mNewsList;
    private ProgressBar mLoadingNews;
    private View mNewsEmpty;

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
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        mNewsList = null;
        mLoadingNews = null;
        mNewsEmpty = null;
    }
}
