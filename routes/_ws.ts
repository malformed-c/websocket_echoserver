import { defineWebSocketHandler } from "nitro/h3"
import type { PeerContext } from 'crossws'

export default defineWebSocketHandler({
  open(peer) {
    peer.send({ user: "server", message: `Welcome ${peer}!` })
    peer.publish("chat", { user: "server", message: `${peer} joined!` })
    peer.send(JSON.stringify(peer.context,  null, 2))

    peer.subscribe("chat")
  },

  upgrade(request) {
    const headers = Object.fromEntries(request.headers.entries())

    let context: PeerContext = {
      'headers': headers
    }

    return { context }
  },

  message(peer, message) {
    if (message.text().includes("ping")) {
      peer.send({ user: "server", message: "pong" })

    } else {
      const msg = {
        user: peer.toString(),
        message: message.toString(),
      }

      peer.send(msg) // echo
      peer.publish("chat", msg)
    }

  },

  close(peer) {
    peer.publish("chat", { user: "server", message: `${peer} left!` })
  },
})
