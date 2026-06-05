const admin = require("firebase-admin");
const express = require("express");
const app = express();

const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://qlmxh-75ede-default-rtdb.firebaseio.com"
});

const db = admin.database();
const firestore = admin.firestore();

db.ref("/presence").on("child_changed", async (snapshot) => {
    const userId = snapshot.key;
    const data = snapshot.val();
    if (!data) return;

    try {
        await firestore.collection("nguoi_dung").doc(userId).update({
            trang_thai_hoat_dong: data.status === "online",
            lan_cuoi_hoat_dong: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`✅ Synced ${userId} → ${data.status}`);
    } catch (e) {
        console.error(`❌ Lỗi: ${e.message}`);
    }
});

app.get("/", (req, res) => res.send("🟢 Sync đang chạy..."));
app.listen(process.env.PORT || 3000, () => console.log("🚀 Server running"));