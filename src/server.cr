require "kemal"

SOCKETS = [] of HTTP::WebSocket

get "/" do |env|
  env.redirect "index.html"
end

ws "/chat" do |socket|
  # Add the client to SOCKETS list
  SOCKETS << socket
  if (SOCKETS.size < 2)
    socket.send({
      type: "message",
      value: "Hi, welcome to the whiteboard!"
    }.to_json)
  else
    SOCKETS.each do |soc|
      soc.send({
       type: "message",
       value: "#{SOCKETS.size} participants."
       }.to_json)
    end
  end

  # Broadcast each message to all clients
  socket.on_message do |message|
    #message = JSON.parse(msg["data"]).as(Hash)
    #if (message["data"]["type"] == "message") 
    SOCKETS.each { |s| s.send message }
    #end   
    #if (message["data"]["type"] == "endgame") 
     #   SOCKETS.each { |socket| socket.send message }
    #end     
  end

  # Remove clients from the list when it's closed
  socket.on_close do
    SOCKETS.delete socket
    SOCKETS.each { |s| s.send({type: "command", value: "endgame"}.to_json) }
    SOCKETS.each { |s| s.send({type: "message", value: "player left the game"}.to_json) }
  end
end

Kemal.run
