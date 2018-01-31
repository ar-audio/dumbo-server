# Marco Polo Server

This is the server for the marco polo game. It's a [koa](https://github.com/koajs/koa) app talking to a [rethinkdb](https://github.com/rethinkdb/rethinkdb) instance. Player-to-player communication is realized using [socket.io](https://socket.io).

## Getting started

The easiest way to set everything up is by using the provided `docker-compose` config:

``` bash
$ docker-compose -p marco-polo up
```

This will start two containers, one for the node application and one for the database. The rethinkdb admin interface is exposed via port 8080. If you need permanent storage for your database, mount `/data` as a volume. If you want to run stuff inside the containers, use `docker exec`. This would look similar to this:

``` bash
$ docker exec -it marcopolo_web_1 /bin/sh
```

## Routes

### `POST /games`

Creates a new player and starts a new game, returning a description of both. For example:

```
❯ http POST http://159.89.110.19:3000/games/
HTTP/1.1 201 Created
Connection: keep-alive
Content-Length: 284
Content-Type: application/json; charset=utf-8
Date: Wed, 31 Jan 2018 14:29:05 GMT

{
    "game": {
        "createdAt": "2018-01-31T14:29:05.991Z",
        "name": "miki-mac",
        "players": [
            "12907f2b-a679-41cc-a378-3480f50ee6fd"
        ],
        "updatedAt": "2018-01-31T14:29:05.991Z"
    },
    "you": {
        "id": "12907f2b-a679-41cc-a378-3480f50ee6fd",
        "token": "cf266a024ad792913c483755473d19460a6a095ed9feda12519b3b17c3a56cbc"
    }
}
```

### `GET /games/$game_id`

Returns a description of the game with ID `$game_id` or 404 if no such game exists:

```
❯ http GET http://159.89.110.19:3000/games/miki-mac
HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 157
Content-Type: application/json; charset=utf-8
Date: Wed, 31 Jan 2018 14:31:24 GMT

{
    "game": {
        "createdAt": "2018-01-31T14:29:05.991Z",
        "name": "miki-mac",
        "players": [
            "12907f2b-a679-41cc-a378-3480f50ee6fd"
        ],
        "updatedAt": "2018-01-31T14:29:05.991Z"
    }
}

```

### `POST /games/$game_id`

Allows a player to join a game if joining is still possible. Otherwise returns `403 FORBIDDEN` with a short error description:

```
❯ http POST http://159.89.110.19:3000/games/miki-mac
HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 323
Content-Type: application/json; charset=utf-8
Date: Wed, 31 Jan 2018 14:32:40 GMT

{
    "game": {
        "createdAt": "2018-01-31T14:29:05.991Z",
        "name": "miki-mac",
        "players": [
            "12907f2b-a679-41cc-a378-3480f50ee6fd",
            "4e725853-26fd-419b-a7fe-ace1d70726c7"
        ],
        "updatedAt": "2018-01-31T14:29:05.991Z"
    },
    "you": {
        "id": "4e725853-26fd-419b-a7fe-ace1d70726c7",
        "token": "96b27664c4b10a62ed2bfa6c334ad6882f11d58859e0d034c95d305d3ad07f80"
    }
}
```

## Websockets and authentication

There is a socket endpoint exposed to connect to via socket io. The first message after connecting has to be an authenication message that contains the token that has been sent to a player when creating / joining a game:

```
socket.emit('auth', {id, token, gameName})
```

After this has been verified to be the token saved in our database all following messages from the client will be broadcastet to all other players in their name:

```
socket.emit('location',{latitude, longitude, accuracy})
socket.emit('abort', null)
socket.emit('gotCaught', null)
```

## Development Notes

### Migrations

The project uses [rethinkdb-migrate](https://github.com/vinicius0026/rethinkdb-migrate/) for migrations. Please see the project for available options. In general, after merging your code with remote changes, you want to run:

``` bash
$ npm run migrate up
```
