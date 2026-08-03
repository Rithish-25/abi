function pemToArrayBuffer(pem) {
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s/g, "");
  
  const binaryString = window.atob(b64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

function base64url(arr) {
  return btoa(String.fromCharCode(...arr))
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

export const sendPushNotification = async (target, role, title, body) => {
  const projectId = process.env.REACT_APP_FIREBASE_PROJECT_ID || 'abirami-laboratory';
  const clientEmail = process.env.REACT_APP_FCM_CLIENT_EMAIL;
  const privateKey = process.env.REACT_APP_FCM_PRIVATE_KEY;

  if (!clientEmail || !privateKey) {
    console.warn("FCM Server credentials not set in environment, skipping push notification.");
    return;
  }

  const cleanedPrivateKey = privateKey.replace(/\\n/g, '\n');

  let topic = '';
  if (target === 'all_users' || target === 'all_doctors') {
    topic = target;
  } else {
    topic = `${role === 'doctor' ? 'doctor' : 'user'}_${target}`;
  }

  try {
    const accessToken = await getAccessToken(clientEmail, cleanedPrivateKey);
    const response = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        message: {
          topic: topic,
          notification: {
            title: title,
            body: body
          },
          android: {
            notification: {
              sound: 'default',
              click_action: 'FLUTTER_NOTIFICATION_CLICK'
            }
          },
          apns: {
            payload: {
              aps: {
                sound: 'default'
              }
            }
          }
        }
      })
    });
    const result = await response.json();
    console.log("FCM v1 push result:", result);
  } catch (error) {
    console.error("FCM v1 push failed:", error);
  }
};
