# WPEnvBox

1. Rename `.env.sample` file to `.env`, change the information
1. Generate `traefik-proxy/.wpenvusers` file with `htpasswd -c traefik-proxy/.wpenvusers username`
1. Create `traefik-proxy/acme.json` file and change permission `chmod 600 traefik-proxy/acme.json`


10  apt install apt-transport-https ca-certificates curl software-properties-common
11  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
12  add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"
13  apt update
14  apt-cache policy docker-ce
15  apt list --upgradable
16  apt upgrade
17  apt-cache policy docker-ce
18  apt install docker-ce
19  systemctl status docker
20  adduser wpenv
21  usermod -aG sudo wpenv
22  usermod -aG docker wpenv
   
5  sudo apt-install npm
6  sudo apt install npm
10  curl -sL https://deb.nodesource.com/setup_12.x -o nodesource_setup.sh
11  vim nodesource_setup.sh
12  sudo bash nodesource_setup.sh
13  sudo apt-get install -y nodejs gcc g++ make
17  apt  install docker-compose
18  sudo apt  install docker-compose
22  apt install htpasswd
23  sudo apt install htpasswd
24  sudo apt install apache2-utils
220  sudo apt install php7.4-cli php7.4-simplexml
221 sudo apt install unzip
222 curl -sS https://getcomposer.org/installer -o composer-setup.php
223 sudo php composer-setup.php --install-dir=/usr/local/bin --filename=composer
