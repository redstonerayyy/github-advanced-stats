# Github Advanced Stats

Yet another stats generator for github. Inspired by [jstrieb/github-stats](https://github.com/jstrieb/github-stats) but adjusted so languages are displayed more accurately.
This works by cloning all specified repositories and then analyzing them.
The Configuration is specified in `config.json`.
It can be run locally with NodeJS or on Github Actions.

![](https://raw.githubusercontent.com/Redstonerayy/github-advanced-stats/master/output/userinfo.svg#gh-light-mode-only)
![](https://raw.githubusercontent.com/Redstonerayy/github-advanced-stats/master/output/userinfo.svg#gh-dark-mode-only)
![](https://raw.githubusercontent.com/Redstonerayy/github-advanced-stats/master/output/languages.svg#gh-light-mode-only)
![](https://raw.githubusercontent.com/Redstonerayy/github-advanced-stats/master/output/languages.svg#gh-dark-mode-only)

## How to use this

1. Be aware of the [limitations](#limitations)
2. Fork this repository and edit the config
3. Add a Github Access Token (`public_repo, read:project, read:user, repo:status, user:email`) as the enviroment variable `GHTOKEN` (via secret)
4. Start a build in Github Actions and let it complete
5. Add this to your README

```
![](https://raw.githubusercontent.com/<your username>/github-advanced-stats/master/output/userinfo.svg#gh-light-mode-only)
![](https://raw.githubusercontent.com/<your username>/github-advanced-stats/master/output/userinfo.svg#gh-dark-mode-only)
![](https://raw.githubusercontent.com/<your username>/github-advanced-stats/master/output/languages.svg#gh-light-mode-only)
![](https://raw.githubusercontent.com/<your username>/github-advanced-stats/master/output/languages.svg#gh-dark-mode-only)
```

## Limitations

-   may not work with large repositories
-   not every language (but every language can be added)

## Contributing

-   Issues can be used for bugs and for feature requests (although these might take some time).
-   You can contribute with a PR.
-   If there is anything else, open an issue
