# NeuVector UI extension

This is a plugin for the [Rancher Dashboard](https://github.com/rancher/dashboard) which allows you to interact with NeuVector.

View the [https://open-docs.neuvector.com](https://open-docs.neuvector.com) for more in-depth info on how to use the UI and how Kubewarden works.

> _Note_: The UI does not have full functionalities of standalone NeuVector UI and SSO NeuVector UI. It is a lite version to let user access some core features. But we provided SSO link to redirect to the NeuVector UI.
## Development

1. From the root directory, install the packages

```sh
yarn install
```

2. Run the dashboard locally

```sh
API=https://<rancher-host> yarn dev
```

On the server side, you need to have a deployed Rancher SSO with NeuVector cluster.
