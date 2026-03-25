<h1 align="center" id="title">Save Pass Mobile</h1>

<p id="description">A simple password manager that stores your passwords and TOTP codes in one place with the ability to sync all your data across devices including your phone.</p>

<div align="center">

![GitHub package.json version](https://img.shields.io/github/package-json/v/royaly-dev/savepass) [![Download](https://img.shields.io/badge/Download-Latest%20Release-blue?logo=github&logoColor=white)](https://github.com/royaly-dev/savepass/releases/latest)

</div>

<img src="img.png" />

<h2>🚀 Features</h2>

Here're some of the project's best features:

*   Save your password
*   Save your TOTP code (like an Authenticator app)
*   Sync between devices (on the same network)
*   Import / Export your data in a JSON file

<h2>🖥️ Installation Steps :</h2>

1. Go to <a href="https://github.com/royaly-dev/savepass/releases/latest">GitHub Releases</a> and download the latest update

2. Execute the installer on your android device

3. Let the onboarding process guide you

4. enjoy the app !


<h2>🛠️ Build it from source :</h2>

1. First clone this repositorie :

    ```bash
    git clone https://github.com/royaly-dev/savepass.git
    ```

2. Then change to the savepass_mobile branch :

    ```bash
    git checkout savepass_mobile
    ```

3. Install the dependencies :
    ```bash
    npm i
    ```

    > **Note:** To run and test the app you need to have android studio with vertual device, an installation guide can be found [Here.](https://developer.android.com/studio/install?hl=fr)

3. Now you can build from source !

    ```bash
    npx expo prebuild
    ```

    ```bash
    cd android/
    ```

    ```bash
    ./gradlew assembleRelease
    ```

<h2>✨ Credits</h2>
This project was mostly written by me, but to fix some issues I had with the electron-forge builder I asked GitHub Copilot to help me figure out what was wrong.
