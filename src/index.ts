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
        console.log("msg:", message);
      }
    } else {
      // Old messages
    }
  });

  sock.ev.on("creds.update", saveCreds);
};

startBot();
