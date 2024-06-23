


function handleMessages(io) {
 io.on('connection',(socket)=>{
    console.log("new client connected");
    socket.on('sendMessage',(message)=>{
        console.log(message);
        socket.on('disconnect',()=>{
            console.log("client disconnected");
        })
    })
 })
}

module.exports = { handleMessages };
