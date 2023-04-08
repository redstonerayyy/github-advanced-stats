# Github Language Stats

Using this dependency free NodeJS project you can analyse your Github repositories regarding the used programming languages.
It works by cloning all your repositories and then analysing each file. It can be run locally with NodeJS or on Github Actions.
Because of this, it doesn't use the Github API, but cloning your repositories can take time, especially if they are large.

## How to use this (will be extended in the future)

1. Be aware of the [limitations](#limitations)
2. Fork this repository and edit the config


## Limitations

- currently private repos are not supported
- may not work with large repositories
- not every language (but every language can be added)

## Possible Improvements

- add more languages
- make colors for languages better
- add support for private repos
- more in-depth code analysis (therefore more stats)
- more config options (e.g. add languages in config)

## Contributing

- Issues can be used for bugs and for feature requests (although these might take some time).
- You can contribute with a PR.
- If there is anything else, open an issue
