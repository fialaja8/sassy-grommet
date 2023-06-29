## Publish sassy-grommet

 1. Manually increase version in package.json
 2. Navigate to root directory
 3. `yarn install`
 4. `yarn dist`
 5. Navigate to `/dist` directory
 6. Check that npm registry is not set to local (if it is:`npm config set registry https://registry.npmjs.org/`)
 7. `npm publish`
