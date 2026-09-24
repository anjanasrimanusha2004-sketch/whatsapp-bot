const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys")
const qrcode = require("qrcode-terminal")

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth')
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true
    })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if(connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode!== 1
            if(shouldReconnect) startBot()
        } else if(connection === 'open') {
            console.log("✅ Bot 24/7 Online!")
        }
    })

    sock.ev.on('group-participants.update', async (anu) => {
        if (anu.action == 'add') {
            await sock.sendMessage(anu.id, { text: `Welcome මචං! 🎉 @${anu.participants[0].split('@')[0]} අපේ Group එකට!`, mentions: anu.participants })
        }
    })

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0]
        if (!msg.message || msg.key.fromMe) return
        const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").toLowerCase()
        const from = msg.key.remoteJid

        if (text === '!rules') {
            await sock.sendMessage(from, { text: "📌 *GROUP RULES*\n1. කුණුහරප එපා\n2. Link එපා\n3. Respect එකෙන් ඉන්න" })
        }
        if (text === '!menu' || text === 'hi' || text === 'hello') {
            await sock.sendMessage(from, { text: "හෙලෝ! මම Group Bot 🤖\n!rules - Rules බලන්න" })
        }
    })
}
startBot()
