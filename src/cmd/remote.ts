import axios from 'axios'
import dotenv from 'dotenv'
import ws from 'ws'
import type { Packet } from '../types/packet'

dotenv.config()

// parse url and append /create
const url = new URL(process.env.BYTESOCKS_INSTANCE || '')
url.pathname = '/create';

(async () => {
    const response = await axios.get(url.toString())
    console.log(response.data)

    url.pathname = response.data.key

    const socket = new ws(url.toString())

    socket.on('open', () => {
        console.log('connected')
    })

    socket.on('message', (data) => {
        console.log('recv ->', new String(data))

        // try parse json
        try {
            const packet : Packet = JSON.parse(data.toString())
            
            if (packet.msgType === 'HELLO') {
                const response : Packet = {
                    id: packet.id,
                    msgType: 'CHALLENGE',
                    data: null,
                    timestamp: Date.now()
                }

                socket.send(JSON.stringify(response))
            }
        } catch (e) {
            console.error('not json')
        }
    })
})()
