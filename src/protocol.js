const protocol = {
    map: (socket, map) => {
        socket.emit('map', {
            mapData: map
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

export default protocol;