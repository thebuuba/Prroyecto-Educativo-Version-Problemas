# Paddle (MoR) Setup para AulaBase (RD)

Este documento deja Paddle como pasarela de pago mensual con Firebase Functions.

## 1) Crear productos y precios en Paddle

1. En Paddle Billing crea un producto para el plan mensual (ej: `AulaBase Mensual`).
2. Crea al menos un precio recurrente mensual.
3. Copia el `price_id` (ejemplo: `pri_...`).

## 2) Configurar secretos en Firebase Functions

En la raiz del proyecto:

```bash
firebase functions:secrets:set PADDLE_API_KEY
firebase functions:secrets:set PADDLE_WEBHOOK_SECRET
```

Luego (opcional) define entorno live o sandbox:

```bash
# por defecto usa sandbox si no defines nada
export PADDLE_ENV=sandbox
# en produccion:
# export PADDLE_ENV=live
```

## 3) Desplegar Functions

```bash
firebase deploy --only functions
```

Funciones nuevas:

- `createPaddleCheckout` (callable)
- `createPaddleCustomerPortal` (callable)
- `paddleWebhook` (HTTP)

## 4) Configurar webhook en Paddle

1. Copia URL de la function `paddleWebhook`:
   - `https://us-central1-<tu-proyecto>.cloudfunctions.net/paddleWebhook`
2. En Paddle Dashboard crea Webhook Destination con esa URL.
3. Activa eventos de suscripcion:
   - `subscription.created`
   - `subscription.updated`
   - `subscription.paused`
   - `subscription.resumed`
   - `subscription.canceled`
   - `subscription.past_due`

## 5) Firestore que se actualiza automaticamente

El webhook escribe:

- `billing_events/{eventId}`
- `billing_subscriptions/{subscriptionId}`
- `entitlements/{uid}`
- `billing_customers/{uid}` (cuando se crea cliente)

Campo clave para acceso premium:

- `entitlements/{uid}.active` (boolean)

## 6) Flujo recomendado en frontend

Checkout:

```js
const result = await window.EduGestCloud.createPaddleCheckout('pri_xxxxx', {
  successUrl: `${location.origin}/configuracion?billing=success`,
  cancelUrl: `${location.origin}/configuracion?billing=cancel`,
});
window.location.href = result.checkoutUrl;
```

Portal cliente:

```js
const result = await window.EduGestCloud.createPaddleCustomerPortal(location.origin + '/configuracion');
window.location.href = result.portalUrl;
```

## 7) Regla de negocio para bloquear funciones premium

Antes de mostrar o ejecutar funciones premium, valida:

1. Usuario autenticado
2. `entitlements/{uid}.active === true`

Si es `false`, mostrar pantalla de pago y boton "Activar plan mensual".

## 8) Produccion

Checklist:

1. Cambiar `PADDLE_ENV=live`
2. Crear precio live en Paddle
3. Reconfigurar webhook live
4. Probar alta, renovacion, cancelacion y past_due
5. Activar logs/alertas para errores de `paddleWebhook`

## 9) Estado actual del repositorio

El backend activo ya no incluye el flujo de registro por correo.
En este momento las Functions se concentran en Paddle y en el webhook de suscripciones.
