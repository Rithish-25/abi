import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

function pemToArrayBuffer(pem) {
  if (!pem) return new ArrayBuffer(0);
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/\\n/g, '')
    .replace(/\\r/g, '')
    .replace(/\\/g, '')
    .replace(/\n/g, '')
    .replace(/\r/g, '')
    .replace(/\s+/g, '')
    .replace(/"/g, '');

  const binaryString = window.atob(b64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

function base64url(arr) {
  return btoa(String.fromCharCode(...new Uint8Array(arr)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

async function generateSignedJwt(clientEmail, privateKeyPem) {
  const header = {
    alg: "RS256",
    typ: "JWT"
  };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now
  };

  const enc = new TextEncoder();
  const headerStr = base64url(enc.encode(JSON.stringify(header)));
  const payloadStr = base64url(enc.encode(JSON.stringify(payload)));
  const signInput = `${headerStr}.${payloadStr}`;

  const privateKeyBuffer = pemToArrayBuffer(privateKeyPem);
  const cryptoKey = await window.crypto.subtle.importKey(
    "pkcs8",
    privateKeyBuffer,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: { name: "SHA-256" }
    },
    false,
    ["sign"]
  );

  const signature = await window.crypto.subtle.sign(
    { name: "RSASSA-PKCS1-v1_5" },
    cryptoKey,
    enc.encode(signInput)
  );

  const signatureStr = base64url(new Uint8Array(signature));
  return `${signInput}.${signatureStr}`;
}

async function getAccessToken(clientEmail, privateKeyPem) {
  const jwt = await generateSignedJwt(clientEmail, privateKeyPem);
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });
  const data = await response.json();
  return data.access_token;
}

const sendSingleFcmMessage = async (projectId, accessToken, messageData) => {
  try {
    const response = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ message: messageData })
    });
    const result = await response.json();
    console.log("FCM v1 push result:", result);
    return result;
  } catch (err) {
    console.error("FCM single push error:", err);
  }
};

export const sendPushNotification = async (target, role, title, body) => {
  const projectId = process.env.REACT_APP_FIREBASE_PROJECT_ID || 'abirami-laboratory';
  const clientEmail = process.env.REACT_APP_FCM_CLIENT_EMAIL;
  const privateKey = process.env.REACT_APP_FCM_PRIVATE_KEY;

  if (!clientEmail || !privateKey) {
    console.warn("FCM Server credentials not set in environment, skipping push notification.");
    return;
  }

  const cleanedPrivateKey = privateKey.replace(/\\n/g, '\n');

  try {
    const accessToken = await getAccessToken(clientEmail, cleanedPrivateKey);

    const buildMessage = (recipientSpec) => ({
      ...recipientSpec,
      notification: {
        title: title,
        body: body
      },
      data: {
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
        screen: 'notifications',
        title: title,
        body: body
      },
      android: {
        priority: 'HIGH',
        ttl: '86400s',
        notification: {
          title: title,
          body: body,
          sound: 'default',
          click_action: 'FLUTTER_NOTIFICATION_CLICK',
          channel_id: 'abirami_channel',
          notification_priority: 'PRIORITY_MAX',
          default_sound: true,
          default_vibrate_timings: true,
          visibility: 'PUBLIC'
        }
      },
      apns: {
        headers: {
          'apns-priority': '10'
        },
        payload: {
          aps: {
            sound: 'default',
            badge: 1
          }
        }
      }
    });

    if (target === 'all_users' || target === 'all_doctors') {
      const tokensToSend = new Set();
      try {
        const devTokensSnap = await getDocs(collection(db, 'device_tokens'));
        devTokensSnap.forEach(d => {
          const t = d.data()?.token || d.id;
          if (t && typeof t === 'string' && t.length > 20) tokensToSend.add(t);
        });
        const usersSnap = await getDocs(collection(db, 'users'));
        usersSnap.forEach(d => {
          const t = d.data()?.fcmToken;
          if (t && typeof t === 'string' && t.length > 20) tokensToSend.add(t);
        });
        const doctorsSnap = await getDocs(collection(db, 'doctors'));
        doctorsSnap.forEach(d => {
          const t = d.data()?.fcmToken;
          if (t && typeof t === 'string' && t.length > 20) tokensToSend.add(t);
        });
      } catch (e) {
        console.warn("Error fetching broadcast FCM tokens:", e);
      }

      if (tokensToSend.size > 0) {
        // Send directly to registered device tokens (1 message per device -> 1 single notification!)
        for (const token of tokensToSend) {
          await sendSingleFcmMessage(projectId, accessToken, buildMessage({ token: token }));
        }
      } else {
        // Fallback to topic broadcast if no registered device tokens found in Firestore
        await sendSingleFcmMessage(projectId, accessToken, buildMessage({ topic: target }));
      }
    } else {
      // Specific target: check for recipient token in Firestore
      let fcmToken = null;
      try {
        const userDocRef = doc(db, role === 'doctor' ? 'doctors' : 'users', target);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          fcmToken = userDocSnap.data()?.fcmToken;
        }
      } catch (e) {
        console.warn("Failed to fetch target token from Firestore:", e);
      }

      if (fcmToken) {
        await sendSingleFcmMessage(projectId, accessToken, buildMessage({ token: fcmToken }));
      } else {
        const topicName = `${role === 'doctor' ? 'doctor' : 'user'}_${target}`;
        await sendSingleFcmMessage(projectId, accessToken, buildMessage({ topic: topicName }));
      }
    }
  } catch (error) {
    console.error("FCM push failed:", error);
  }
};
