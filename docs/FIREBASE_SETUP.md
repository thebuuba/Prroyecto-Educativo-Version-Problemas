# Firebase Setup

## 1. Configurar el proyecto

1. Crea un proyecto en Firebase.
2. Activa `Authentication > Sign-in method > Email/Password`.
3. Crea una base de datos en `Firestore Database`.
4. Copia la configuracion web del proyecto en [js/firebase-config.js](/Users/natanael/Documents/edugest-main/js/firebase-config.js).
5. Reemplaza el `projectId` por el real en [\.firebaserc](/Users/natanael/Documents/edugest-main/.firebaserc).
6. Publica las reglas de [firestore.rules](/Users/natanael/Documents/edugest-main/firestore.rules).

## 2. Estructura remota

La app ya no guarda todo en un solo documento. Ahora divide el estado por dominios:

- Perfil general: `users/{uid}`
- Segmentos de app: `users/{uid}/app/identity`
- Segmentos de app: `users/{uid}/app/academics`
- Segmentos de app: `users/{uid}/app/assessment`
- Segmentos de app: `users/{uid}/app/settings`

Esto permite crecer sin acercarse tan rapido al limite de 1 MB por documento en Firestore.

## 3. Desplegar en Firebase Hosting

1. Instala Firebase CLI:

```bash
npm install -g firebase-tools
```

2. Inicia sesion:

```bash
firebase login
```

3. Publica reglas:

```bash
firebase deploy --only firestore:rules
```

4. Publica el sitio:

```bash
firebase deploy --only hosting
```

La configuracion de Hosting ya esta lista en [firebase.json](/Users/natanael/Documents/edugest-main/firebase.json).

## 4. Reglas de Firestore

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /app/{documentId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

## 5. Notas

- La app mantiene cache local en IndexedDB para acelerar carga y fallback.
- Si no llenas [js/firebase-config.js](/Users/natanael/Documents/edugest-main/js/firebase-config.js), seguira en modo local.
- No pude dejar las credenciales reales porque no las has compartido todavia.
