const admin = require("firebase-admin");
const express = require("express");
const app = express();

app.use(express.json());

// 🔑 Подключаем ключ из Railway Variables
const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://cheremessenger-default-rtdb.firebaseio.com"
});

const db = admin.database();

// 📩 Слушаем новые сообщения
db.ref("chats").on("child_added", async snapshot => {
  try {
    const message = snapshot.val();
    if (!message || !message.userId || !message.text) return;

    console.log("New message:", message);

    // Забираем все токены
    const tokensSnapshot = await db.ref("tokens").once("value");
    const tokens = Object.values(tokensSnapshot.val() || {});

    if (tokens.length > 0) {
      const payload = {
        notification: {
          title: message.userId,
          body: message.text,
        },
        data: {
          chatId: snapshot.key || "", // можно передавать айдишник сообщения
        },
      };

      const response = await admin.messaging().sendToDevice(tokens, payload, {
        priority: "high", // 🔹 чтобы пуш приходил сразу
      });

      console.log("✅ Notification sent:", response.successCount, "success,", response.failureCount, "failed");
    }
  } catch (error) {
    console.error("❌ Error sending notification:", error);
  }
});

// 🚀 Тестовый роут
app.get("/", (req, res) => res.send("FCM Server Running ✅"));

// Запуск
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
