# Dumbo Game Server

This is the server for the dumbo game. It's a [koa](https://github.com/koajs/koa) app talking to a [rethinkdb](https://github.com/rethinkdb/rethinkdb) instance.

## Getting started

The easiest way to set everything up is by using the provided `docker-compose` config:

``` bash
$ docker-compose -p dumbo-server up
```

This will start two containers, one for the node application and one for the database. The rethinkdb admin interface is exposed via port 8080. If you need permanent storage for your database, mount `/data` as a volume. If you want to run stuff inside the containers, use `docker exec`. This would look similar to this:

``` bash
$ docker exec -it dumboserver_web_1 /bin/sh
``

## Migrations

The project uses [rethinkdb-migrate](https://github.com/vinicius0026/rethinkdb-migrate/) for migrations. Please see the project for available options. In general, after merging your code with remote changes, you want to run:

``` bash
$ npm run migrate up
```
