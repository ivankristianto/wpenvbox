# WPEnvBox

> Manage @wordpress/env stack with automatic traffic routing.

## How To Start

For setting up docker please follow Docker Installation guide.

1. Install WPEnvBox cli package: `npm install -g wpenvbox`
2. Run `wpenvbox init`
3. Fill in all the details
4. Run proxy: `wpenvbox proxy start`
5. Now you can visit the Traefik dashboard based on the url and user you configured
6. To create a new WordPress instance, in a folder that has the `.wp-env.json`, run `wpenvbox app create`
7. Then start the app, `wpenvbox app start`
8. To stop the app `wpenvbox app start`
9. To destroy the app `wpenvbox app destroy`

## Contributing

Pull requests and feedback are welcome. _Contributing guideline will be added later._
