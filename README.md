# WPEnvBox

1. Rename `.env.sample` file to `.env`, change the information
1. Generate `traefik-proxy/.wpenvusers` file with `htpasswd -c traefik-proxy/.wpenvusers username`
1. Create `traefik-proxy/acme.json` file and change permission `chmod 600 traefik-proxy/acme.json`
