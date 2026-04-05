const crypto = require('crypto');

const admin = require('firebase-admin');
const { onCall, onRequest, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');

admin.initializeApp();

const db = admin.firestore();
const auth = admin.auth();

const PADDLE_API_KEY = defineSecret('PADDLE_API_KEY');
const PADDLE_WEBHOOK_SECRET = defineSecret('PADDLE_WEBHOOK_SECRET');

const BILLING_CUSTOMERS_COLLECTION = 'billing_customers';
const BILLING_SUBSCRIPTIONS_COLLECTION = 'billing_subscriptions';
const BILLING_EVENTS_COLLECTION = 'billing_events';
const ENTITLEMENTS_COLLECTION = 'entitlements';
const PADDLE_DEFAULT_CURRENCY = 'USD';

function paddleApiBaseUrl() {
  const env = String(process.env.PADDLE_ENV || 'sandbox').trim().toLowerCase();
  return env === 'live' ? 'https://api.paddle.com' : 'https://sandbox-api.paddle.com';
}

function ensurePaddleConfigured() {
  if (!PADDLE_API_KEY.value()) {
    throw new HttpsError('failed-precondition', 'Paddle no esta configurado. Falta PADDLE_API_KEY.');
  }
}

async function paddleRequest(path, { method = 'GET', body = null } = {}) {
  ensurePaddleConfigured();
  const baseUrl = paddleApiBaseUrl();
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${PADDLE_API_KEY.value()}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let payload = {};
  try {
    payload = await response.json();
  } catch (_) {
    payload = {};
  }
  if (!response.ok) {
    const apiMessage = payload?.error?.detail || payload?.error?.message || `Paddle error (${response.status})`;
    throw new HttpsError('internal', apiMessage);
  }
  return payload?.data;
}

function normalizePeriodRange(range) {
  if (!range || typeof range !== 'object') return { startsAt: null, endsAt: null };
  return {
    startsAt: range.starts_at || null,
    endsAt: range.ends_at || null,
  };
}

function mapEntitlementFromSubscription(subscription) {
  const status = String(subscription?.status || '').toLowerCase();
  const activeStatuses = new Set(['active', 'trialing', 'past_due']);
  return {
    status,
    active: activeStatuses.has(status),
  };
}

async function getOrCreatePaddleCustomerForUid(uid) {
  const userRecord = await auth.getUser(uid);
  const customerRef = db.collection(BILLING_CUSTOMERS_COLLECTION).doc(uid);
  const existingSnap = await customerRef.get();
  const existingCustomerId = existingSnap.data()?.paddleCustomerId || '';
  if (existingCustomerId) {
    return {
      paddleCustomerId: existingCustomerId,
      email: existingSnap.data()?.email || userRecord.email || '',
      name: existingSnap.data()?.name || userRecord.displayName || '',
    };
  }

  const email = String(userRecord.email || '').trim().toLowerCase();
  if (!email) throw new HttpsError('failed-precondition', 'Tu usuario no tiene correo valido para facturacion.');
  const name = String(userRecord.displayName || '').trim() || 'Usuario AulaBase';
  const created = await paddleRequest('/customers', {
    method: 'POST',
    body: {
      email,
      name,
      custom_data: {
        firebase_uid: uid,
      },
    },
  });
  const paddleCustomerId = created?.id;
  if (!paddleCustomerId) throw new HttpsError('internal', 'No se pudo crear el cliente en Paddle.');
  await customerRef.set(
    {
      uid,
      paddleCustomerId,
      email,
      name,
      source: 'paddle',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
  return { paddleCustomerId, email, name };
}

async function saveSubscriptionSnapshot({ eventType, eventId, subscription }) {
  const subscriptionId = subscription?.id;
  if (!subscriptionId) return;

  const uid = String(
    subscription?.custom_data?.firebase_uid ||
      subscription?.customer?.custom_data?.firebase_uid ||
      ''
  ).trim();
  const customerId =
    subscription?.customer_id || subscription?.customer?.id || null;
  const priceId =
    subscription?.items?.[0]?.price?.id ||
    subscription?.items?.[0]?.price_id ||
    null;
  const period = normalizePeriodRange(subscription?.current_billing_period);
  const entitlement = mapEntitlementFromSubscription(subscription);

  await db
    .collection(BILLING_SUBSCRIPTIONS_COLLECTION)
    .doc(subscriptionId)
    .set(
      {
        subscriptionId,
        uid: uid || null,
        customerId,
        status: entitlement.status,
        active: entitlement.active,
        priceId,
        collectionMode: subscription?.collection_mode || null,
        scheduledChange: subscription?.scheduled_change || null,
        currentPeriodStart: period.startsAt,
        currentPeriodEnd: period.endsAt,
        canceledAt: subscription?.canceled_at || null,
        pausedAt: subscription?.paused_at || null,
        eventType: eventType || null,
        lastEventId: eventId || null,
        raw: subscription || null,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

  if (uid) {
    await db
      .collection(ENTITLEMENTS_COLLECTION)
      .doc(uid)
      .set(
        {
          uid,
          provider: 'paddle',
          subscriptionId,
          customerId,
          plan: priceId || null,
          status: entitlement.status,
          active: entitlement.active,
          currentPeriodEnd: period.endsAt,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
  }
}

function verifyPaddleWebhookSignature(req) {
  const header = String(req.get('Paddle-Signature') || '').trim();
  if (!header) return false;
  const secret = String(PADDLE_WEBHOOK_SECRET.value() || '').trim();
  if (!secret) return false;

  const parts = Object.fromEntries(
    header
      .split(';')
      .map((part) => part.trim())
      .map((part) => part.split('='))
      .filter(([k, v]) => k && v)
  );
  const ts = parts.ts;
  const h1 = parts.h1;
  if (!ts || !h1) return false;

  const rawBodyBuffer = req.rawBody;
  const rawBody = rawBodyBuffer ? rawBodyBuffer.toString('utf8') : '';
  const signedPayload = `${ts}:${rawBody}`;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(signedPayload, 'utf8')
    .digest('hex');
  const expectedBuffer = Buffer.from(expected, 'hex');
  const providedBuffer = Buffer.from(String(h1), 'hex');
  if (expectedBuffer.length !== providedBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
}

exports.createPaddleCheckout = onCall(
  { cors: true, secrets: [PADDLE_API_KEY] },
  async (request) => {
    if (!request.auth?.uid) {
      throw new HttpsError('unauthenticated', 'Debes iniciar sesion para abrir el checkout.');
    }
    const uid = request.auth.uid;
    const priceId = String(request.data?.priceId || '').trim();
    if (!priceId) {
      throw new HttpsError('invalid-argument', 'Debes indicar el priceId de Paddle.');
    }

    const { paddleCustomerId, email } = await getOrCreatePaddleCustomerForUid(uid);
    const successUrl = String(request.data?.successUrl || '').trim();
    const cancelUrl = String(request.data?.cancelUrl || '').trim();

    const transaction = await paddleRequest('/transactions', {
      method: 'POST',
      body: {
        items: [{ price_id: priceId, quantity: 1 }],
        customer_id: paddleCustomerId,
        currency_code: PADDLE_DEFAULT_CURRENCY,
        collection_mode: 'automatic',
        checkout: {
          success_url: successUrl || undefined,
          cancel_url: cancelUrl || undefined,
        },
        custom_data: {
          firebase_uid: uid,
          app: 'AulaBase',
        },
      },
    });
    const checkoutUrl = transaction?.checkout?.url || null;
    if (!checkoutUrl) {
      throw new HttpsError('internal', 'Paddle no devolvio checkout URL.');
    }

    await db.collection(BILLING_EVENTS_COLLECTION).add({
      kind: 'checkout_created',
      uid,
      email,
      paddleCustomerId,
      priceId,
      transactionId: transaction?.id || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      ok: true,
      checkoutUrl,
      transactionId: transaction?.id || null,
      paddleCustomerId,
    };
  }
);

exports.createPaddleCustomerPortal = onCall(
  { cors: true, secrets: [PADDLE_API_KEY] },
  async (request) => {
    if (!request.auth?.uid) {
      throw new HttpsError('unauthenticated', 'Debes iniciar sesion para abrir el portal de pagos.');
    }
    const uid = request.auth.uid;
    const { paddleCustomerId } = await getOrCreatePaddleCustomerForUid(uid);
    const returnUrl = String(request.data?.returnUrl || '').trim();

    const session = await paddleRequest(`/customers/${paddleCustomerId}/portal-sessions`, {
      method: 'POST',
      body: {
        return_url: returnUrl || undefined,
      },
    });
    const portalUrl = session?.urls?.general?.overview || session?.url || null;
    if (!portalUrl) {
      throw new HttpsError('internal', 'No se pudo crear la sesion del portal de cliente.');
    }

    return {
      ok: true,
      portalUrl,
    };
  }
);

exports.paddleWebhook = onRequest(
  { cors: true, secrets: [PADDLE_WEBHOOK_SECRET] },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).json({ ok: false, error: 'method-not-allowed' });
      return;
    }
    if (!verifyPaddleWebhookSignature(req)) {
      res.status(401).json({ ok: false, error: 'invalid-signature' });
      return;
    }

    const payload = req.body || {};
    const eventType = String(payload.event_type || '').trim();
    const eventId = String(payload.event_id || payload.notification_id || '').trim();
    const eventRefId = eventId || crypto.randomUUID();
    const eventRef = db.collection(BILLING_EVENTS_COLLECTION).doc(eventRefId);
    const existing = await eventRef.get();
    if (existing.exists) {
      res.status(200).json({ ok: true, dedup: true });
      return;
    }

    await eventRef.set({
      eventId: eventRefId,
      eventType,
      source: 'paddle_webhook',
      receivedAt: admin.firestore.FieldValue.serverTimestamp(),
      payload,
      status: 'received',
    });

    try {
      const subscription = payload?.data || null;
      const updatableEvents = new Set([
        'subscription.created',
        'subscription.updated',
        'subscription.paused',
        'subscription.resumed',
        'subscription.canceled',
        'subscription.trialing',
        'subscription.activated',
        'subscription.past_due',
      ]);
      if (updatableEvents.has(eventType) && subscription?.id) {
        await saveSubscriptionSnapshot({
          eventType,
          eventId: eventRefId,
          subscription,
        });
      }

      await eventRef.set(
        {
          status: 'processed',
          processedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      res.status(200).json({ ok: true });
    } catch (error) {
      console.error('[Paddle webhook] Error procesando evento', error);
      await eventRef.set(
        {
          status: 'error',
          errorMessage: String(error?.message || error),
          processedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      res.status(500).json({ ok: false, error: 'processing-failed' });
    }
  }
);
