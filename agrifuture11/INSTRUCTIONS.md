# Building Your Android APK with Trusted Web Activity (TWA)

This guide will walk you through packaging your Progressive Web App (PWA) into an Android APK that you can install on a device and submit to the Google Play Store.

**Prerequisites:**
1.  **A Hosted PWA:** Your web application must be deployed to a live, HTTPS-enabled URL (e.g., `https://your-app.web.app`). A TWA cannot load a local `http://localhost` address.
2.  **Android Studio:** Download and install the latest version of [Android Studio](https://developer.android.com/studio).
3.  **A Google Play Developer Account:** Required for publishing to the Play Store (a one-time $25 fee).

---

### Step 1: Create a New Android Studio Project

1.  Open Android Studio.
2.  Click **"New Project"**.
3.  Select the **"No Activity"** template and click **"Next"**.
4.  Configure your project:
    *   **Name:** `AgriFuture India`
    *   **Package name:** `com.example.agrifutureindia` (You should use your own domain, e.g., `in.agrifuture.app`). This must be unique on the Play Store.
    *   **Save location:** Choose a directory for your project.
    *   **Language:** Keep it as `Kotlin`.
    *   **Minimum SDK:** `API 21: Android 5.0 (Lollipop)` is a good choice for broad compatibility.
5.  Click **"Finish"**. Wait for the project to build.

---

### Step 2: Add TWA Support Library

1.  In the Project pane on the left, navigate to `Gradle Scripts` > `build.gradle.kts (Module :app)`.
2.  Double-click to open it.
3.  Inside the `dependencies { ... }` block, add the following line:
    ```kotlin
    implementation("androidx.browser:browser:1.8.0")
    ```
4.  A bar will appear at the top saying "Gradle files have changed...". Click **"Sync Now"**.

---

### Step 3: Configure the Android Manifest

1.  Navigate to `app` > `src` > `main` > `AndroidManifest.xml`.
2.  Inside the `<application>` tag, add the following `<activity>` block. **This is the core of the TWA.**

    ```xml
    <activity
        android:name="androidx.browser.trusted.TrustedWebActivity"
        android:exported="true">
        <intent-filter>
            <action android:name="android.intent.action.MAIN" />
            <category android:name="android.intent.category.LAUNCHER" />
        </intent-filter>
        <intent-filter>
            <action android:name="android.intent.action.VIEW" />
            <category android:name="android.intent.category.DEFAULT" />
            <category android:name="android.intent.category.BROWSABLE" />
            <!--
              IMPORTANT: Update this host to your PWA's domain.
              This is what links the app to your website.
            -->
            <data
                android:host="your-app.web.app"
                android:scheme="https" />
        </intent-filter>
    </activity>
    ```

3.  **CRITICAL:** Change `android:host="your-app.web.app"` to the actual domain where your web app is hosted.

---

### Step 4: Link Your Website to Your App (Digital Asset Links)

This step proves you own both the website and the app, which allows the app to run in full-screen mode without the browser address bar.

1.  **Generate the SHA-256 Fingerprint:**
    *   In Android Studio, click on `Build` > `Generate Signed Bundle / APK...`.
    *   Select **Android App Bundle** and click **Next**.
    *   Under `Key store path`, click **"Create new..."**.
    *   Fill out the form to create a new keystore file (e.g., `agrifuture.jks`). **Remember your passwords! Store this file securely.**
    *   After creating the key, click **Next**.
    *   Choose **`release`** as the build variant and click **"Create"**. This will generate a signed `.aab` file.
    *   Now, in the right-hand panel of Android Studio, click on `Gradle`.
    *   Navigate to `AgriFuture India` > `Tasks` > `android` and double-click on `signingReport`.
    *   In the "Run" window at the bottom, find the `Variant: release` section and copy the **SHA-256** fingerprint. It will look like this: `FA:C6:17:45:....`

2.  **Create the `assetlinks.json` file:**
    *   Create a new file named `assetlinks.json`.
    *   Paste the following content into it:

    ```json
    [{
      "relation": ["delegate_permission/common.handle_all_urls"],
      "target": {
        "namespace": "android_app",
        "package_name": "com.example.agrifutureindia",
        "sha256_cert_fingerprints": [
          "FA:C6:17:45:..."
        ]
      }
    }]
    ```

3.  **Update `assetlinks.json`:**
    *   Replace `com.example.agrifutureindia` with your app's unique package name from Step 1.
    *   Replace `FA:C6:17:45:...` with the **SHA-256 fingerprint** you copied.

4.  **Upload `assetlinks.json`:**
    *   Upload this file to your web server so it is accessible at the URL:
        `https://your-app.web.app/.well-known/assetlinks.json`
    *   You may need to create the `.well-known` directory.

---

### Step 5: Build the Final APK

1.  Go back to `Build` > `Generate Signed Bundle / APK...`.
2.  Select **APK** this time and click **Next**.
3.  Use the same keystore file and passwords you created in Step 4.
4.  Choose `release` as the build variant.
5.  Click **Finish**.

Android Studio will now build a signed `app-release.apk` file. You can find this file in `YourProjectFolder/app/release/`. This is the file you can install on an Android phone or upload to the Google Play Console.