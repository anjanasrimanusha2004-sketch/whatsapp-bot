const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys")
const P = require("pino")

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys')
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: P({ level: 'silent' }),
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    })
    if (!sock.authState.creds.registered) {
        const phoneNumber = "94754310112"
        setTimeout(async () => {
            let code = await sock.requestPairingCode(phoneNumber)
            console.log(`\n======================================`)
            console.log(` PAIRING CODE: ${code}`)
            console.log(`======================================\n`)
        }, 3000)
    }
    sock.ev.on('creds.update', saveCreds)
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode!== DisconnectReason.loggedOut
            if (shouldReconnect) startBot()
        } else if (connection === 'open') {
            console.log("✅ Bot 24/7 Online!")
        }
    })
    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0]
        if (!msg.message || msg.key.fromMe) return
        const from = msg.key.remoteJid
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ""
        if (text === ".ping") {
            await sock.sendMessage(from, { text: "Pong! 🏓 Bot Online!" })
        }
    })
}
startBot()
