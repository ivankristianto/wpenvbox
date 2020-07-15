FROM codercom/code-server:latest

RUN sudo apt-get update \
 && sudo apt-get install -y \
    dirmngr \
    apt-transport-https \
    lsb-release \
    ca-certificates \
    wget

RUN sudo wget -O /etc/apt/trusted.gpg.d/php.gpg https://packages.sury.org/php/apt.gpg \
    && echo "deb https://packages.sury.org/php/ $(lsb_release -sc) main" | sudo tee /etc/apt/sources.list.d/php.list \
    && curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -

RUN sudo apt-get update \
 && sudo apt-get install -y \
    php7.4-cli \
    php7.4-simplexml \
    php7.4-mysqli \
    nodejs \
    gcc \
    g++ \
    make \
    unzip \
 && sudo rm -rf /var/lib/apt/lists/*

RUN cd ~ \
  && curl -sS https://getcomposer.org/installer -o composer-setup.php \
  && sudo php composer-setup.php --install-dir=/usr/local/bin --filename=composer \
  && rm -f composer-setup.php \
  && curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar \
  && chmod +x wp-cli.phar \
  && sudo mv wp-cli.phar /usr/local/bin/wp \
