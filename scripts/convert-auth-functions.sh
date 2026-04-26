#!/bin/bash

# Script para convertir funciones del panel autenticacion a español

AUTH_DIR="/Users/natanael/Documents/edugest-main/js/panels/autenticacion"

cd "$AUTH_DIR"

# Convertir función principal
sed -i '' "s|export function registerAuthPanel|export function registrarPanelAutenticacion|g" principal.js

# Convertir funciones principales en principal.js
sed -i '' "s|function loginAuth|function autenticarUsuario|g" principal.js
sed -i '' "s|function registerAuth|function registrarUsuario|g" principal.js
sed -i '' "s|function authWithProvider|function autenticarConProveedor|g" principal.js
sed -i '' "s|function finishAuthSession|function finalizarSesionAutenticacion|g" principal.js
sed -i '' "s|function showAuthenticatedDashboard|function mostrarTableroAutenticado|g" principal.js
sed -i '' "s|function forceCloseM|function forzarCerrarModal|g" principal.js

# Actualizar llamadas a funciones
sed -i '' "s|loginAuth()|autenticarUsuario()|g" principal.js
sed -i '' "s|registerAuth()|registrarUsuario()|g" principal.js
sed -i '' "s|authWithProvider|autenticarConProveedor|g" principal.js
sed -i '' "s|finishAuthSession|finalizarSesionAutenticacion|g" principal.js
sed -i '' "s|showAuthenticatedDashboard|mostrarTableroAutenticado|g" principal.js
sed -i '' "s|forceCloseM|forzarCerrarModal|g" principal.js

# Actualizar registro en init
sed -i '' "s|window.RENDERS.auth|window.RENDERS.autenticacion|g" principal.js
sed -i '' "s|registerAuthPanel|registrarPanelAutenticacion|g" principal.js

echo "Funciones de autenticación convertidas a español"