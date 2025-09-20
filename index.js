const admin = require("firebase-admin");
const express = require("express");
const app = express();

const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://cheremessenger-default-rtdb.firebaseio.com"
});

const db = admin.database();

// слушаем новые сообщения
db.ref("chats").on("child_added", async snapshot => {
  const message = snapshot.val();

  const tokensSnapshot = await db.ref("tokens").once("value");
  const tokens = Object.values(tokensSnapshot.val() || {});

  if (tokens.length > 0) {
    const payload = {
      notification: {
        title: message.userId,
        body: message.text,
      }
    };

    admin.messaging().sendToDevice(tokens, payload)
      .then(res => console.log("Notification sent:", res))
      .catch(console.error);
  }
});

app.get("/", (req, res) => res.send("FCM Server Running ✅"));
app.listen(process.env.PORT || 3000, () => console.log("Server started"));
