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

## License

This project is licensed under the [MIT License](LICENSE).
