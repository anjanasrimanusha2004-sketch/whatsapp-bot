const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const P = require("pino")

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info')

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: P({ level: 'silent' }),
        browser: ["Ubuntu", "Chrome", "22.04.4"]
    })

    if (!sock.authState.creds.registered) {
        let phoneNumber = "94754310112" // මෙතනට ඔයාගේ Bot Number එක දාන්න 94න් පටන් අරන් (Ex: 94712345678)
        let code = await sock.requestPairingCode(phoneNumber)
        console.log("PAIRING CODE: " + code)
    }

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if (connection === 'open') {
            console.log('✅ Bot 24/7 Online!')
        }
    })

    // MESSAGE REPLY PART එක
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0]
        if (!msg.message || msg.key.fromMe) return

        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ""
        console.log('Message received: ' + text)

        const from = msg.key.remoteJid

        if (text.toLowerCase() == 'hi' || text.toLowerCase() == 'hello') {
            await sock.sendMessage(from, { text: 'Hello! 👋 Bot is Online! \n\nType.menu to see menu' })
        }
        if (text.toLowerCase() == '.menu') {
            await sock.sendMessage(from, { text: '*BOT MENU*\n\n1. hi - Say Hello\n2..menu - Show this menu\n\nBot is working 24/7 ✅' })
        }
    })
}

startBot()
