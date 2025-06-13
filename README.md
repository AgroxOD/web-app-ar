# Web AR Application

This repository contains a small web application for displaying an AR model.
Large assets, such as the 3D model used by the page, are not kept in the
repository. Instead they can be fetched using the provided script.

## Downloading the model

The `assets/download_models.sh` script downloads the required `model.glb`
file. Set the `MODEL_URL` environment variable to the URL where the model is
hosted and run the script:

```sh
MODEL_URL=https://example.com/path/to/model.glb ./assets/download_models.sh
```

After running, the file will be saved as `assets/model.glb`.

## Required assets

The application expects `assets/model.glb` to exist when served. A
`model-placeholder.txt` file is included so the directory exists in the
repository, but it will not be used by the application.


## Serving the site

Before starting, make sure the 3D model has been downloaded using the
`assets/download_models.sh` script as shown above.  The project is a
fully static site and can be served with any static file server.  One easy
option is [`http-server`](https://www.npmjs.com/package/http-server):

```sh
npx http-server .
```

Open the printed URL in your browser to view the application.

## API endpoint

The JavaScript bundles expect an API to be reachable at a base URL provided
via the `VITE_API_BASE_URL` environment variable at build time.  If this
variable is empty, the code falls back to `location.origin`.  Ensure your API
is accessible from that URL under the `/api` path before launching the site.

