package com.inaturalistmobilenativescreens.legacy;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

import android.app.Application;
import android.os.Bundle;

public class INaturalistApp extends Application {
    public static Integer VERSION = 1;
    private boolean mCalledStartForeground = false;

    public boolean hasCalledStartForeground() {
        return mCalledStartForeground;
    }
    public void setCalledStartForeground(boolean value) {
        mCalledStartForeground = value;
    }

    @Override
    public void onCreate() {
        super.onCreate();
    }

    /* Used for accessing iNat service results - since passing large amounts of intent data
     * is impossible (for example, returning a huge list of projects/guides won't work via intents)
     */
    private Map<String, Serializable> mServiceResults = new HashMap<String, Serializable>();
    public void setServiceResult(String key, Serializable value) {
    	mServiceResults.put(key,  value);
    }
    public Serializable getServiceResult(String key) {
    	return mServiceResults.get(key);
    }

    private Map<String, Bundle> mServiceParams = new HashMap<>();
    public void setServiceParams(String uuid, Bundle params) {
        mServiceParams.put(uuid,  params);
    }
    public Bundle getServiceParams(String uuid) {
        Bundle params = mServiceParams.get(uuid);
        mServiceParams.remove(uuid);
        return params;
    }
}
