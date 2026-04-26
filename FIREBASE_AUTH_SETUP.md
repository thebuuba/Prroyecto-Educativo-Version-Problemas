# Configuración de Autenticación Social en Firebase

## Problema: Los botones de Google y Facebook se cierran solos

Si los botones de inicio de sesión con Google y Facebook se cierran inmediatamente sin mostrar error, lo más probable es que el dominio actual no esté autorizado en Firebase Authentication.

## Solución: Autorizar el dominio en Firebase Console

### Paso 1: Acceder a Firebase Console
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: `proyectivoeducativo`
3. En el menú lateral, ve a **Authentication** > **Sign-in method**

### Paso 2: Configurar dominios autorizados
1. En la sección de configuración de Authentication, busca el enlace **Authorized domains** o **Dominios autorizados**
2. Haz clic en **Add domain** o **Agregar dominio**
3. Agrega los siguientes dominios según tu entorno:

#### Para desarrollo local:
```
localhost
127.0.0.1
```

#### Para producción:
```
tu-dominio.com
www.tu-dominio.com
```

### Paso 3: Habilitar proveedores de autenticación
Asegúrate de que los siguientes proveedores estén habilitados:

#### Google:
1. En **Sign-in method**, busca **Google**
2. Haz clic en el ícono de edición
3. Habilita el proveedor
4. Agrega tu dominio a la lista de dominios autorizados
5. Guarda los cambios

#### Facebook:
1. En **Sign-in method**, busca **Facebook**
2. Haz clic en el ícono de edición
3. Habilita el proveedor
4. Necesitarás configurar una app en Facebook Developers
5. Agrega tu dominio a la lista de dominios autorizados
6. Guarda los cambios

### Paso 4: Configurar aplicación de Facebook (opcional)

Si quieres usar el login de Facebook:

1. Ve a [Facebook Developers](https://developers.facebook.com/)
2. Crea una nueva aplicación o selecciona una existente
3. En la configuración de la aplicación, agrega tu dominio como:
   - **App Domains**: tu-dominio.com
   - **Site URL**: https://tu-dominio.com/
4. Copia el **App ID** y **App Secret**
5. Pega estos valores en la configuración de Facebook en Firebase Console

## Verificación

Después de configurar los dominios:

1. Limpia la caché de tu navegador
2. Recarga la aplicación
3. Intenta iniciar sesión con Google o Facebook
4. Si aparece un error, revisa la consola del navegador para ver el mensaje específico

## Mensajes de error comunes

### "auth/unauthorized-domain"
- **Causa**: El dominio no está en la lista de dominios autorizados
- **Solución**: Agrega el dominio en Firebase Console

### "auth/popup-blocked"
- **Causa**: El navegador está bloqueando ventanas emergentes
- **Solución**: Habilita popups en tu navegador para este sitio

### "auth/popup-closed-by-user"
- **Causa**: La ventana se cerró antes de completar el login
- **Solución**: Asegúrate de no cerrar la ventana manualmente

## Configuración actual del proyecto

- **Project ID**: proyectivoeducativo
- **Auth Domain**: proyectivoeducativo.firebaseapp.com
- **API Key**: AIzaSyAnI7si3y8MSdO376HqYYoHQAt3QwBAdcE

## Soporte

Si después de seguir estos pasos el problema persiste:
1. Revisa la consola del navegador (F12) para ver errores específicos
2. Verifica que la configuración de Firebase sea correcta
3. Asegúrate de que los proveedores estén habilitados en Firebase Console