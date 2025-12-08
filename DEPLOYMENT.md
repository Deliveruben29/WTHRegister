# Deployment en Render.com - Guía Completa

## 🚀 Estado Actual
- ✅ App funciona perfectamente en local
- ⚠️ Funcionalidad intermitente en producción (Render.com)

## 🔧 Cambios Realizados

### 1. Optimización de Scripts (package.json)
Se agregó el script `start` que usa `sirv-cli` para servir archivos estáticos de manera eficiente en producción.

```json
"start": "npx sirv-cli dist --single --port ${PORT:-10000}"
```

### 2. Archivo de Configuración (render.yaml)
Se creó `render.yaml` para automatizar el deployment con la configuración correcta.

## 📋 Configuración en Render.com

### Paso 1: Variables de Entorno
En el dashboard de Render.com, ve a tu servicio y configura estas variables de entorno:

```
VITE_SUPABASE_URL=https://chciyhhgcdzloytfbvez.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoY2l5aGhnY2R6bG95dGZidmV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxMDEzMTksImV4cCI6MjA4MDY3NzMxOX0.bR7-usfRAPnGt_rKErGt11mDAWCzUsPm0lM5aflklUg
```

### Paso 2: Settings del Servicio
En Render Dashboard > Settings:

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
npm start
```

**Environment:**
```
Node
```

### Paso 3: Auto-Deploy
- Branch: `main` (o la que uses)
- Auto-Deploy: ✅ Activado

## 🐛 Solución a la Intermitencia

### Causa Principal: Cold Starts
En el plan gratuito de Render:
- El servicio se "duerme" después de 15 minutos sin tráfico
- Tarda 30-60 segundos en "despertar"
- Durante este tiempo, la app parece no funcionar

### Soluciones:

#### Opción 1: Mantener el servicio activo (Gratis)
Usa un servicio como [UptimeRobot](https://uptimerobot.com/) o [Cron-job.org](https://cron-job.org/) para hacer un ping a tu app cada 10 minutos.

**Configuración:**
- URL a monitorear: `https://tu-app.onrender.com`
- Intervalo: 10 minutos
- Método: GET

#### Opción 2: Upgrade a plan Starter ($7/mes)
- Sin cold starts
- Siempre activo
- Mejor rendimiento

#### Opción 3: Health Check Endpoint (Ya configurado)
El `render.yaml` incluye `healthCheckPath: /` para que Render verifique que la app está funcionando.

## 🔍 Debugging en Producción

### Ver logs en tiempo real:
1. Ve a tu servicio en Render Dashboard
2. Click en "Logs"
3. Busca errores relacionados con:
   - Variables de entorno
   - Build failures
   - Network errors

### Comandos útiles:
```bash
# Ver build en local (simular producción)
npm run build
npm start

# Verificar que las variables se cargan
npm run build
# Inspecciona dist/assets/*.js para ver si las variables están embedidas
```

## ✅ Checklist de Deployment

- [ ] Variables de entorno configuradas en Render
- [ ] Build command: `npm install && npm run build`
- [ ] Start command: `npm start`
- [ ] Auto-deploy activado
- [ ] Primer deploy exitoso
- [ ] App carga correctamente (puede tardar ~1 min la primera vez)
- [ ] Login funciona
- [ ] Registro funciona
- [ ] QR Code funciona

## 🆘 Si sigue sin funcionar

1. **Verifica los logs de Render** - busca errores específicos
2. **Prueba el build local** - ejecuta `npm run build && npm start`
3. **Verifica las variables** - asegúrate que están en Render (no solo en `.env` local)
4. **Clear cache y redeploy** - a veces Render cachea builds antiguos

## 📞 Próximos Pasos

Después de hacer estos cambios:

1. Haz commit y push de todos los archivos
2. Render detectará el `render.yaml` y usará esa configuración
3. Espera ~2-3 minutos para que el build complete
4. Verifica que todo funciona

Si el problema persiste, revisaremos los logs juntos.
