// functions/index.js
// Deploy with:  firebase deploy --only functions
//
// Prerequisites:
//   npm install -g firebase-tools
//   firebase login
//   firebase init functions   (choose JavaScript, in your project root)
//   cd functions && npm install

const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { initializeApp }     = require('firebase-admin/app');
const { getMessaging }      = require('firebase-admin/messaging');
const { getFirestore }      = require('firebase-admin/firestore');

initializeApp();

// ── Trigger: fires whenever a notification doc is written to Firestore ────────
// Path: users/{userId}/notifications/{notifId}
// This is the same path your app already writes to via notifyOthers().
// The Cloud Function reads the recipient's FCM tokens and sends a push.

exports.sendPushOnNotification = onDocumentCreated(
  'users/{userId}/notifications/{notifId}',
  async (event) => {
    const snap   = event.data;
    const params = event.params;

    if (!snap) return;

    const notif  = snap.data();
    const userId = params.userId;

    // Don't push if already read (shouldn't happen on create, but be safe)
    if (notif.read) return;

    // ── Fetch recipient's FCM tokens ──────────────────────────────────────
    const db       = getFirestore();
    const userSnap = await db.doc(`users/${userId}`).get();
    if (!userSnap.exists) return;

    const userData  = userSnap.data();
    const tokenMap  = userData.fcmTokens || {};
    const tokens    = Object.keys(tokenMap);
    if (tokens.length === 0) return;

    // ── Build the notification payload ────────────────────────────────────
    const typeLabels = {
      chat:     '💬 New message',
      assigned: '👤 Task assigned',
      solved:   '✅ Task solved',
      approval: '✦ Approval needed',
      reopened: '↩ Task reopened',
    };

    const title = typeLabels[notif.type] || '✦ eTask';
    const body  = notif.line  || notif.taskTitle || 'You have a new notification';
    const tag   = `etask-task-${notif.taskId || 'general'}`;

    // ── Send to each registered device token ──────────────────────────────
    const messaging = getMessaging();
    const results   = await Promise.allSettled(
      tokens.map(token =>
        messaging.send({
          token,
          notification: { title, body },
          data: {
            // data fields must all be strings
            tag,
            taskId:    notif.taskId    || '',
            taskTitle: notif.taskTitle || '',
            type:      notif.type      || '',
            url:       '/',            // adjust if your app lives at a subpath
          },
          webpush: {
            notification: {
              title,
              body,
              icon:             '/etask-192.svg',
              badge:            '/etask-32.svg',
              tag,
              requireInteraction: true,
            },
            fcmOptions: {
              link: '/'
            }
          }
        })
      )
    );

    // ── Clean up any stale/expired tokens ─────────────────────────────────
    const staleTokens = [];
    results.forEach((result, i) => {
      if (result.status === 'rejected') {
        const code = result.reason?.errorInfo?.code || '';
        if (
          code === 'messaging/registration-token-not-registered' ||
          code === 'messaging/invalid-registration-token'
        ) {
          staleTokens.push(tokens[i]);
        }
      }
    });

    if (staleTokens.length > 0) {
      const update = {};
      staleTokens.forEach(t => { update[`fcmTokens.${t}`] = require('firebase-admin/firestore').FieldValue.delete(); });
      await db.doc(`users/${userId}`).update(update);
      console.info(`Removed ${staleTokens.length} stale token(s) for user ${userId}`);
    }

    const sent = results.filter(r => r.status === 'fulfilled').length;
    console.info(`Push sent to ${sent}/${tokens.length} device(s) for user ${userId}`);
  }
);
