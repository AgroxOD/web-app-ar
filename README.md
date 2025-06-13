# Web AR Application

This repository contains a small web application for displaying an AR model. Large assets, such as the 3D model used by the page, are not kept in the repository. They can be fetched using the provided helper script.

## Downloading the model

Run `assets/download_models.sh` from the project root to download the required `model.glb`. The URL of the model is taken from the `MODEL_URL` environment variable. If it is not set, a placeholder URL is used.

```sh
MODEL_URL=https://example.com/path/to/model.glb ./assets/download_models.sh
```

For Cloudflare R2 storage you might use:

```sh
MODEL_URL=https://<account>.r2.cloudflarestorage.com/<bucket>/model.glb ./assets/download_models.sh
```

After running, the file will be saved as `assets/model.glb`.

## Required assets

The application expects `assets/model.glb` to exist when served. A `model-placeholder.txt` file is included so the directory exists in the repository but it is not used by the application.

## Running locally

Use the `serve.sh` script to start a small development server. It checks for `assets/model.glb` and downloads it automatically if missing before launching `python3 -m http.server`.
