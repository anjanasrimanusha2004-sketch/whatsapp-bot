const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys')
const P = require("pino")
const http = require("http")

// Render එකේ Port එක Open කරනවා
http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Bot is Online 24/7');
}).listen(process.env.PORT || 3000, () => {
    console.log("Server started on port " + (process.env.PORT || 3000))
});

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info')
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: P({ level: 'silent' }),
        browser: ["Ubuntu", "Chrome", "22.04.4"]
    })

    if (!sock.authState.creds.registered) {
        let phoneNumber = let phoneNumber = "94754310112"
        console.log("Requesting Pairing Code for: " + phoneNumber)
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(phoneNumber)
                console.log("=========================")
                console.log("PAIRING CODE: " + code)
                console.log("=========================")
            } catch (e) {
                console.log("Error getting pairing code: ", e)
            }
        }, 3000)
    }

    sock.ev.on('creds.update', saveCreds)
    sock.ev.on('connection.update', (update) => {
        const { connection } = update
        if (connection === 'open') console.log('Bot 24/7 Online!')
    })

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0]
        if (!msg.message || msg.key.fromMe) return
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ""
        console.log('Message received: ' + text)
        const from = msg.key.remoteJid
        if (text.toLowerCase() == 'hi' || text.toLowerCase() == 'hello' || text.toLowerCase() == '.menu') {
            await sock.sendMessage(from, { text: 'Hello! Bot is Online! 👋\n\nType.menu' })
        }
    })
}
startBot()

