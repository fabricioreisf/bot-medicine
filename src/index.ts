import makeWASocket, {
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
  DisconnectReason,
} from "baileys";
import QRCode from "qrcode";

const startBot = async () => {
  const { version } = await fetchLatestBaileysVersion();
  const { state, saveCreds } = await useMultiFileAuthState("auth");

  const sock = makeWASocket({
    auth: state,
    version,
    markOnlineOnConnect: false,
  });

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      console.log(await QRCode.toString(qr, { type: "terminal" }));
    }
    if (
      connection === "close" &&
      lastDisconnect?.error?.output?.statusCode ===
        DisconnectReason.restartRequired
    ) {
      startBot();
    }
  });

  sock.ev.on("messages.upsert", ({ type, messages }) => {
    if (type === "notify") {
      // New messages
      for (const message of messages) {
        console.log(message);
        if (!message.key?.fromMe) {
          const msgContent =
            message.message?.conversation ||
            message.message?.extendedTextMessage?.text;
          const senderId = message.key?.remoteJid;
          if (senderId)
            if (msgContent?.toLowerCase().includes("cigarro"))
              sock.sendMessage(senderId, {
                text: `Quer ganhar um 🚚caminhão🚛 de 🚬cigarros🚬? Envie 👺CIGARRO👺 para 6️⃣2️⃣9️⃣8️⃣1️⃣1️⃣3️⃣5️⃣1️⃣2️⃣1️⃣ e 🏆participe🎖!👊👉`,
              });
        }
      }
    } else {
      // Old messages
    }
  });

  sock.ev.on("creds.update", saveCreds);
};

startBot();
