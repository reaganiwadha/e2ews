import axios from 'axios'
import dotenv from 'dotenv'
import ws from 'ws'

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
        console.log(new String(data))
    })
})()
