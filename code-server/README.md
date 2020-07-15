# code-server

[![Docker Pulls](https://img.shields.io/docker/pulls/ivankristianto/code-server.svg?maxAge=2592000)]()

> Forked from cdr / code-server and added some required libraries.

## Base Docker Image
[codercom/code-server](https://hub.docker.com/r/codercom/code-server/)

### Installation
    docker pull ivankristianto/code-server

### Usage

    docker run -it -p 127.0.0.1:8080:8080 \
      -v "$PWD:/home/coder/project" \
      -u "$(id -u):$(id -g)" \
      codercom/code-server:latest

### Libraries Added

* PHP7.4
* Node 12
* Composer
* WP-CLI

Enjoy !!

