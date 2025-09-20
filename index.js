const admin = require("firebase-admin");
const express = require("express");
const app = express();

// 🔹 Получаем ключ из переменной среды и исправляем переносы
const serviceAccount = JSON.parse(
  process.env.FIREBASE_KEY.replace(/\\n/g, "\n")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://cheremessenger-default-rtdb.firebaseio.com"
});

const db = admin.database();

// Слушаем новые сообщения
db.ref("chats").on("child_added", async snapshot => {
  const message = snapshot.val();
  console.log("New message:", message);

  const tokensSnapshot = await db.ref("tokens").once("value");
  const tokens = Object.values(tokensSnapshot.val() || {});

  if (tokens.length > 0) {
    const payload = {
      notification: {
        title: message.userId,
        body: message.text,
      }
    };

    try {
      const res = await admin.messaging().sendToDevice(tokens, payload);
      console.log("✅ Notification sent:", res);
    } catch (err) {
      console.error("❌ Error sending notification:", err);
    }
  }
});

app.get("/", (req, res) => res.send("FCM Server Running ✅"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
