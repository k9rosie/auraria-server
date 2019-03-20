const Protocol = {
    join: (socket, map, entities) => {
        socket.emit('join', {
            map: map,
            entities: entities
        })
    },

    update: (socket, changes) => {
        socket.emit('update', {
            changes: changes
        })
    },

    tilesheet: (socket, tilesheet) => {
        socket.emit('tilesheet', {
            data: tilesheet
        })
    }
}

export default Protocol;