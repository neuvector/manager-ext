# manager-ext
Manager UI extension for Rancher

## Dev build
1. Run yarn under root folder
2. Run API=\<web server IP\>:\<web server port\> yarn dev

## Git actions
Git actions build should be run as release build.
This workflow needs to be triggered by creating a new release with the correct name. 
The release name needs to match the name and version properties defined in the pkg/neuvector/package.json file.

