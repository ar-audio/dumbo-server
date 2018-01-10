# Dumbo Game Server

This is the server for the dumbo game. It's a [koa](https://github.com/koajs/koa) app talking to a [rethinkdb](https://github.com/rethinkdb/rethinkdb) instance.

## Getting started

The easiest way to set everything up is by using the provided `docker-compose` config:

``` bash
$ docker-compose -p dumbo-ser ver up
```

This will start two containers, one for the node application and one for the database. The rethinkdb admin interface is exposed via port 8080. If you need permanent storage for your database, mount `/data` as a volume.
