const admin = require("firebase-admin");

// 🔹 Инициализация Firebase Admin
const serviceAccount = JSON.parse(
  process.env.FIREBASE_KEY.replace(/\\n/g, "\n")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const messaging = admin.messaging(); // Получаем объект messaging

// 🔹 Токен клиента
const registrationToken = 'fKWpKBYpQxO-DTVTgjKHTz:APA91bGrwQntB15RmALveIF4MtC0HSrWErYlQ46SmhyyvbtJjSdfb9QHGqhJyIVM0b4MLnr_9TL23MLOQbN_T7rMTB1El5TtUu3fXMJz8mM4ElxKAcJsrxk';

const message = {
  data: {
    score: '850',
    time: '2:45'
  },
  token: registrationToken
};

// 🔹 Отправка уведомления
messaging.send(message)
  .then((response) => {
    console.log('✅ Successfully sent message:', response);
  })
  .catch((error) => {
    console.error('❌ Error sending message:', error);
  });
