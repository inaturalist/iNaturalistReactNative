package com.inaturalistmobilenativescreens.legacy;

import com.inaturalistmobilenativescreens.R;
import static com.inaturalistmobilenativescreens.legacy.INaturalistService.*;

import static java.net.HttpURLConnection.HTTP_GONE;
import static java.net.HttpURLConnection.HTTP_UNAUTHORIZED;
import static java.net.HttpURLConnection.HTTP_UNAVAILABLE;

import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.os.Handler;
import android.os.Looper;
import android.util.Pair;
import android.widget.Toast;

import androidx.localbroadcastmanager.content.LocalBroadcastManager;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
// import org.tinylog.Logger;

import java.io.File;
import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.concurrent.TimeUnit;

import okhttp3.Headers;
import okhttp3.HttpUrl;
import okhttp3.MediaType;
import okhttp3.MultipartBody;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class INaturalistServiceImplementation {
    private static final String TAG = "INaturalistServiceImplementation";

    private final INaturalistApp mApp;
    private final Handler mHandler;
    private final Context mContext;

    private long mLastConnectionTest = 0;

    private Headers mResponseHeaders = null;
    private Date mRetryAfterDate = null;
    private long mLastServiceUnavailableNotification = 0;
    private boolean mServiceUnavailable = false;

    private JSONArray mResponseErrors;
    private JSONObject mLastResponseJson;

    private int mLastStatusCode = 0;

    public INaturalistServiceImplementation(Context context) {
        mApp = (INaturalistApp) context.getApplicationContext();
        mContext = context;
        mHandler = new Handler(Looper.getMainLooper());
    }

    public void onHandleIntentWorker(final Intent intent) {
        if (intent == null) return;

        String action = intent.getAction();

        if (action == null) return;

        // Logger.tag(TAG).debug("Service: " + action);
        try {
            if (action.equals(ACTION_GET_NEWS)) {
                SerializableJSONArray news = getNews();

                Intent reply = new Intent(ACTION_NEWS_RESULT);
                reply.putExtra(RESULTS, news);
                LocalBroadcastManager.getInstance(mContext).sendBroadcast(reply);
            }
        } catch (AuthenticationException e) {
            // Logger.
        }
    }

    private class AuthenticationException extends Exception {
        private static final long serialVersionUID = 1L;
    }

    public static String getUserAgent(Context context) {
        PackageInfo info = null;
        try {
            info = context.getPackageManager().getPackageInfo(context.getPackageName(), 0);
        } catch (PackageManager.NameNotFoundException e) {
            // Logger.tag(TAG).error(e);
        }

        String userAgent = USER_AGENT.replace("%BUILD%", info != null ? String.valueOf(info.versionCode) : String.valueOf(INaturalistApp.VERSION));
        userAgent = userAgent.replace("%VERSION%", info != null ? info.versionName : String.valueOf(INaturalistApp.VERSION));
        // Remove non-ASCII characters (invalid for HTTP headers)
        userAgent = userAgent.replaceAll("[^\\x00-\\x7F]", "");

        return userAgent;
    }

    private SerializableJSONArray getNews() throws AuthenticationException {
        String url = API_HOST + "/posts/for_user";
        JSONArray json = get(url); // If user is logged-in, returns his news (using an authenticated endpoint)
        return new SerializableJSONArray(json);
    }

    private JSONArray get(String url) throws AuthenticationException {
        return request(url, "get", null, null);
    }

    private JSONArray request(String url, String method, ArrayList<Pair<String, String>> params, JSONObject jsonContent) throws AuthenticationException {
        OkHttpClient client = new OkHttpClient().newBuilder()
                .followRedirects(true)
                .followSslRedirects(true)
                .connectTimeout(HTTP_CONNECTION_TIMEOUT_SECONDS, TimeUnit.SECONDS)
                .writeTimeout(HTTP_READ_WRITE_TIMEOUT_SECONDS, TimeUnit.SECONDS)
                .readTimeout(HTTP_READ_WRITE_TIMEOUT_SECONDS, TimeUnit.SECONDS)
                .build();
        Request.Builder requestBuilder = new Request.Builder()
                .addHeader("User-Agent", getUserAgent(mApp))
                .url(url);

        mRetryAfterDate = null;
        mServiceUnavailable = false;

        // Logger.tag(TAG).debug(String.format(Locale.ENGLISH, "URL: %s - %s (params: %s / %s)", method, url, (params != null ? params.toString() : "null"), (jsonContent != null ? jsonContent.toString() : "null")));

        method = method.toUpperCase();
        RequestBody requestBody = null;

        if (method.equals("GET") && (params != null)) {
            HttpUrl.Builder httpUriBuilder = HttpUrl.parse(url).newBuilder();

            for (int i = 0; i < params.size(); i++) {
                httpUriBuilder.addQueryParameter(params.get(i).first, params.get(i).second);
            }
            HttpUrl httpUrl = httpUriBuilder.build();
            requestBuilder = new Request.Builder()
                    .addHeader("User-Agent", getUserAgent(mApp))
                    .url(httpUrl);

        } else if ((jsonContent == null) && (params == null) && (method.equals("PUT") || method.equals("POST"))) {
            // PUT/POST with empty body
            requestBody = RequestBody.create(null, new byte[]{});

        } else if (jsonContent != null) {
            // PUT/POST with JSON body content
            requestBuilder.addHeader("Content-type", "application/json");
            requestBody = RequestBody.create(JSON, jsonContent.toString());

        } else if (params != null) {
            // PUT/POST with "Standard" multipart encoding
            MultipartBody.Builder requestBodyBuilder = new MultipartBody.Builder()
                    .setType(MultipartBody.FORM);

            for (int i = 0; i < params.size(); i++) {
                if (params.get(i).first.equalsIgnoreCase("image") || params.get(i).first.equalsIgnoreCase("file") || params.get(i).first.equalsIgnoreCase("user[icon]") || params.get(i).first.equalsIgnoreCase("audio")) {
                    // If the key equals to "image", we use FileBody to transfer the data
                    String value = params.get(i).second;
                    MediaType mediaType;
                    if (value != null) {
                        String name;
                        if (params.get(i).first.equalsIgnoreCase("audio")) {
                            name = "file";
                            requestBuilder.addHeader("Accept", "application/json");
                            mediaType = MediaType.parse("audio/" + value.substring(value.lastIndexOf(".") + 1));
                        } else {
                            name = params.get(i).first;
                            mediaType = MediaType.parse("image/" + value.substring(value.lastIndexOf(".") + 1));
                        }
                        File file = new File(value);
                        requestBodyBuilder.addFormDataPart(name, file.getName(),
                                RequestBody.create(mediaType, file));
                    }
                } else {
                    // Normal string data
                    requestBodyBuilder.addFormDataPart(params.get(i).first, params.get(i).second);
                }
            }

            requestBody = requestBodyBuilder.build();
        }

        try {
            mResponseErrors = null;
            mLastResponseJson = null;

            Request request = requestBuilder.method(method, requestBody).build();
            Response response = client.newCall(request).execute();

            // Logger.tag(TAG).debug("Response: " + response.code() + ": " + response.message());

            mLastStatusCode = response.code();

            // Logger.tag(TAG).debug(String.format(Locale.ENGLISH, "(for URL: %s - %s (params: %s / %s))", method, url, (params != null ? params.toString() : "null"), (jsonContent != null ? jsonContent.toString() : "null")));

            String content = null;
            try {
                content = response.body().string();
            } catch (Exception exc) {
                // Logger.tag(TAG).error(exc);
            }

            JSONArray json = null;

            if (content != null) {
                // Logger.tag(TAG).debug(content);

                try {
                    json = new JSONArray(content);
                } catch (JSONException e) {
                    try {
                        JSONObject jo = new JSONObject(content);
                        json = new JSONArray();
                        json.put(jo);
                    } catch (JSONException e2) {
                    }
                }
            }

            mResponseHeaders = response.headers();
            response.close();

            try {
                if ((json != null) && (json.length() > 0)) {
                    JSONObject result = json.getJSONObject(0);
                    mLastResponseJson = result;
                    if (result.has("errors")) {
                        // Error response
                        // Logger.tag(TAG).error("Got an error response: " + result.get("errors").toString());
                        mResponseErrors = result.getJSONArray("errors");
                        return null;
                    }
                }
            } catch (JSONException e) {
                // Logger.tag(TAG).error(e);
            }

            if ((content != null) && (content.length() == 0)) {
                // In case it's just non content (but OK HTTP status code) - so there's no error
                json = new JSONArray();
            }

            if (response.isSuccessful()) {
                return json;
            } else {
                // HTTP error of some kind - Check for response code
                switch (mLastStatusCode) {
                    case HTTP_UNAUTHORIZED:
                        // Authentication error

                        // Extract error description, if exists
                        if (json != null) {
                            JSONObject innerJson = json.optJSONObject(0);
                            if (innerJson != null) {
                                Object errorObject = innerJson.opt("error");
                                if (errorObject instanceof String) {
                                    mResponseErrors = new JSONArray();
                                    mResponseErrors.put((String) errorObject);
                                } else if (errorObject != null) {
                                    if (((JSONObject) errorObject).optJSONObject("original") != null) {
                                        String error = ((JSONObject) errorObject).optJSONObject("original").optString("error");
                                        if (error != null) {
                                            mResponseErrors = new JSONArray();
                                            mResponseErrors.put(error);
                                        }
                                    }
                                }
                            }
                        }
                        throw new AuthenticationException();

                    case HTTP_UNAVAILABLE:
                        // Logger.tag(TAG).error("503 server unavailable");
                        mServiceUnavailable = true;

                        // Find out if there's a "Retry-After" header
                        List<String> headers = response.headers("Retry-After");
                        if (headers.size() > 0) {
                            for (String timestampString : headers) {
                                // Logger.tag(TAG).error("Retry after raw string: " + timestampString);
                                SimpleDateFormat format = new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss zzz");
                                try {
                                    mRetryAfterDate = format.parse(timestampString);
                                    // Logger.tag(TAG).error("Retry after: " + mRetryAfterDate);
                                    break;
                                } catch (ParseException e) {
                                    // Logger.tag(TAG).error(e);
                                    try {
                                        // Try parsing it as a seconds-delay value
                                        int secondsDelay = Integer.valueOf(timestampString);
                                        // Logger.tag(TAG).error("Retry after: " + secondsDelay);
                                        Calendar calendar = Calendar.getInstance();
                                        calendar.add(Calendar.SECOND, secondsDelay);
                                        mRetryAfterDate = calendar.getTime();

                                        break;
                                    } catch (NumberFormatException exc) {
                                        // Logger.tag(TAG).error(exc);
                                    }
                                }
                            }
                        }

                        // Show service not available message to user
                        mHandler.post(() -> {
                            String errorMessage;
                            Date retryAfterDate = mRetryAfterDate;
                            Date currentTime = Calendar.getInstance().getTime();

                            if (retryAfterDate == null || currentTime == null) {
                                // No specific retry time
                                errorMessage = mContext.getString(R.string.please_try_again_in_a_few_hours);
                            } else if (retryAfterDate.before(currentTime)) {
                                // Service is down and we don't know when it'll be back
                                errorMessage = mContext.getString(R.string.please_try_again_soon);
                            } else {
                                // Specific retry time
                                long differenceSeconds = (retryAfterDate.getTime() - currentTime.getTime()) / 1000;

                                long delay;
                                String delayType;

                                if (differenceSeconds < 60) {
                                    delayType = mContext.getString(R.string.seconds_value);
                                    delay = differenceSeconds;
                                } else if (differenceSeconds < 60 * 60) {
                                    delayType = mContext.getString(R.string.minutes);
                                    delay = (differenceSeconds / 60);
                                } else {
                                    delayType = mContext.getString(R.string.hours);
                                    delay = (differenceSeconds / (60 * 60));
                                }
                                errorMessage = String.format(mContext.getString(R.string.please_try_again_in_x), delay, delayType);
                            }

                            if (System.currentTimeMillis() - mLastServiceUnavailableNotification > 30000) {
                                // Make sure we won't notify the user about this too often
                                mLastServiceUnavailableNotification = System.currentTimeMillis();
                                Toast.makeText(mContext.getApplicationContext(), mContext.getString(R.string.service_temporarily_unavailable) + " " + errorMessage, Toast.LENGTH_LONG).show();
                            }
                        });

                        break;

                    case HTTP_GONE:
                        // TODO create notification that informs user some observations have been deleted on the server,
                        // click should take them to an activity that lets them decide whether to delete them locally
                        // or post them as new observations
                        break;
                    default:
                }

                return null;
            }
        } catch (IOException e) {
            // Logger.tag(TAG).error("Error for URL " + url + ":" + e);
            // Logger.tag(TAG).error(e);

            // Test out the Internet connection in multiple ways (helps pin-pointing issue)
            performConnectivityTest();
        }

        return null;
    }

    private void performConnectivityTest() {
        long currentTime = System.currentTimeMillis();

        // Perform connectivity test once every 5 minutes at most
        if (currentTime - mLastConnectionTest < 5 * 60 * 1000) {
            return;
        }

        mLastConnectionTest = currentTime;

        // Logger.tag(TAG).info("Performing connectivity test");

        contactUrl("https://api.inaturalist.org");
        contactUrl("http://api.inaturalist.org");
        contactUrl("https://www.inaturalist.org/ping");
        contactUrl("http://www.inaturalist.org/ping");
        contactUrl("https://www.naturalista.mx/ping");
        contactUrl("http://www.naturalista.mx/ping");
        contactUrl("https://www.google.com");
        contactUrl("http://www.example.com");
    }

    private void contactUrl(String url) {
        OkHttpClient client = new OkHttpClient();
        Request request = new Request.Builder()
                .addHeader("User-Agent", getUserAgent(mApp))
                .head()
                .url(url)
                .build();

        try {
            // Logger.tag(TAG).info("Contacting " + url);
            Response response = client.newCall(request).execute();
            // Logger.tag(TAG).info("isSuccessful: " + response.isSuccessful() + "; response code = " + response.code());
            response.close();
        } catch (Exception e) {
            // Logger.tag(TAG).error("Failed contacting " + url);
            // Logger.tag(TAG).error(e);
        }
    }
}
