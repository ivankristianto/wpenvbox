# Installation Guides

WPEnvBox need [Docker engine](https://docs.docker.com/engine/) as the requirement.

## Mac OS X

On Mac OS X, you can use [Docker for Mac](https://docs.docker.com/docker-for-mac/install/). That's all you need.

## Windows

On Windows, you can use [Docker for Windows](https://docs.docker.com/docker-for-windows/install/). That's all you need.

## Ubuntu 20.04

Follow these steps for Docker installation on live server with Ubuntu 20.04.

1. Install Docker and add new user to run docker container.
```
apt install apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"
apt update
apt-cache policy docker-ce
apt list --upgradable
apt upgrade
apt-cache policy docker-ce
apt install docker-ce docker-compose 
systemctl status docker
adduser wpenv
usermod -aG sudo wpenv
usermod -aG docker wpenv
```

2. Install npm and few other required libraries
```
curl -sL https://deb.nodesource.com/setup_12.x -o nodesource_setup.sh
bash nodesource_setup.sh
apt install nodejs gcc g++ make
apt install apache2-utils unzip
```

3. Install php7.4-cli for composer requirements
```
apt install php7.4-cli php7.4-simplexml
curl -sS https://getcomposer.org/installer -o composer-setup.php
php composer-setup.php --install-dir=/usr/local/bin --filename=composer
```

4. Now follow installation for the WPEnvBox cli package.

## CentOS 8

**Will be added later**
