# Paddle (MoR) Setup para AulaBase (RD)

> Estado actual: este flujo es legacy y no forma parte del montaje activo. La base de datos oficial es Supabase PostgreSQL. Antes de reactivar Paddle, migra estos registros a tablas SQL en `server/src/db/migrations/` y expón endpoints en `server/src/routes/`.

## 1) Crear productos y precios en Paddle

1. En Paddle Billing crea un producto para el plan mensual (ej: `AulaBase Mensual`).
2. Crea al menos un precio recurrente mensual.
3. Copia el `price_id` (ejemplo: `pri_...`).

## 2) Configurar secretos

Pendiente de migrar a la API SQL.

```bash
PADDLE_API_KEY=
PADDLE_WEBHOOK_SECRET=
```

Luego (opcional) define entorno live o sandbox:

```bash
# por defecto usa sandbox si no defines nada
export PADDLE_ENV=sandbox
# en produccion:
# export PADDLE_ENV=live
```

## 3) Despliegue

No hay deploy activo para billing. El webhook debe implementarse en `server/`.

## 4) Configurar webhook en Paddle

1. Crea un endpoint HTTP en `server/` para el webhook.
2. En Paddle Dashboard crea Webhook Destination con esa URL.
3. Activa eventos de suscripcion:
   - `subscription.created`
   - `subscription.updated`
   - `subscription.paused`
   - `subscription.resumed`
   - `subscription.canceled`
   - `subscription.past_due`

## 5) Tablas SQL esperadas

Cuando se reactive, el webhook debe escribir en Supabase SQL, por ejemplo:

- `billing_events`
- `billing_subscriptions`
- `entitlements`
- `billing_customers`

Campo clave para acceso premium:

- `entitlements.active` (boolean)

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
2. `entitlements.active === true` para el usuario autenticado en SQL

Si es `false`, mostrar pantalla de pago y boton "Activar plan mensual".

## 8) Produccion

Checklist:

1. Cambiar `PADDLE_ENV=live`
2. Crear precio live en Paddle
3. Reconfigurar webhook live hacia la API SQL
4. Probar alta, renovacion, cancelacion y past_due
5. Activar logs/alertas para errores del endpoint de webhook SQL

## 9) Estado actual del repositorio

El backend activo es `server/` con Supabase SQL.
