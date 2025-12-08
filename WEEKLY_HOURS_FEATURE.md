# Configuración de Horas Semanales Personalizadas

## 🎯 Nueva Funcionalidad

Ahora cada usuario puede configurar sus **horas semanales oficiales** según su contrato de trabajo. El sistema calculará el overtime basado en este valor personalizado en lugar de las 40 horas fijas.

## 📋 Cambios Realizados

### 1. **Base de Datos** (Supabase)
- ✅ Añadido campo `weekly_hours` a la tabla `profiles`
- ✅ Valor por defecto: 40 horas
- ✅ Validación: 1-168 horas (rango válido por semana)

### 2. **Backend** (AuthContext)
- ✅ Función `updateWeeklyHours()` para actualizar horas en la BD
- ✅ Carga automática de `weeklyHours` del perfil del usuario
- ✅ Sincronización en tiempo real con la sesión

### 3. **Frontend** (Dashboard)
- ✅ Modal de Settings expandido con configuración de horas
- ✅ Cálculo dinámico de overtime basado en horas personalizadas
- ✅ Indicador visual actualizado: "X.Xh / [horas_usuario]h"
- ✅ Barra de progreso semanal ajustada a horas personalizadas

---

## 🚀 Pasos para Activar la Funcionalidad

### Paso 1: Ejecutar Script SQL en Supabase

1. Ve a tu proyecto Supabase: https://supabase.com/dashboard
2. Selecciona tu proyecto "WTH Register"
3. Ve a **SQL Editor** (en el menú lateral)
4. Copia y pega el contenido del archivo `supabase_add_weekly_hours.sql`
5. Haz click en **RUN** (ejecutar)

**Archivo:** `supabase_add_weekly_hours.sql`

```sql
-- Migration: Add weekly_hours to profiles

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS weekly_hours INTEGER DEFAULT 40;

UPDATE profiles 
SET weekly_hours = 40 
WHERE weekly_hours IS NULL;

ALTER TABLE profiles 
ADD CONSTRAINT weekly_hours_valid 
CHECK (weekly_hours >= 1 AND weekly_hours <= 168);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, weekly_hours)
  VALUES (new.id, new.raw_user_meta_data->>'name', new.email, 40);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Paso 2: Verificar que el Script se Ejecutó Correctamente

En el SQL Editor, ejecuta esta consulta para verificar:

```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'weekly_hours';
```

Deberías ver:
- **column_name:** `weekly_hours`
- **data_type:** `integer`
- **column_default:** `40`

### Paso 3: Deploy del Código

Los cambios de código ya están listos. Solo necesitas hacer push:

```bash
git add .
git commit -m "feat: Add configurable weekly hours per user

- Users can now set their official weekly hours in Settings
- Overtime calculation is now based on personalized hours
- Default: 40 hours/week
- Range: 1-168 hours/week"

git push origin master
```

Render detectará el cambio y hará el deployment automáticamente.

---

## 📖 Cómo Usar la Nueva Funcionalidad

### Para el Usuario:

1. **Acceder a Settings:**
   - En el Dashboard, haz click en el icono de engranaje ⚙️ (Settings)

2. **Configurar Horas Semanales:**
   - En la sección "Official Weekly Hours"
   - Ingresa tus horas semanales oficiales (ej: 30, 35, 40, 45, etc.)
   - Haz click en **"Save"**

3. **Ver el Cambio:**
   - El indicador "Weekly Hours" ahora mostrará: `X.Xh / [tus_horas]h`
   - El overtime se calculará: `horas_trabajadas - horas_oficiales`

### Ejemplos de Uso:

| Tipo de Contrato | Horas Semanales | Ejemplo |
|------------------|-----------------|---------|
| Medio tiempo | 20h | Overtime después de 20h |
| 3/4 tiempo | 30h | Overtime después de 30h |
| Tiempo completo | 40h | Overtime después de 40h (default) |
| Extendido | 45h | Overtime después de 45h |

---

## ✅ Beneficios

✨ **Personalización:** Cada usuario tiene su configuración única  
📊 **Precisión:** Cálculo correcto de overtime según contrato  
🎯 **Flexibilidad:** Soporta cualquier tipo de jornada laboral  
⚡ **Fácil de usar:** Interfaz intuitiva en Settings  
🔒 **Seguro:** Validación tanto en frontend como backend  

---

## 🧪 Testing

### Test Local:

1. Inicia el servidor: `npm run dev`
2. Ve al Dashboard
3. Haz click en Settings ⚙️
4. Cambia las horas semanales (ej: de 40 a 35)
5. Guarda los cambios
6. Verifica que:
   - El toast muestra "Weekly hours updated to 35h!"
   - El indicador cambia a "X.Xh / 35h"
   - El cálculo de overtime se ajusta

### Test de Validación:

- Intenta ingresar 0 horas → Debería mostrar error
- Intenta ingresar 200 horas → Debería mostrar error
- Intenta ingresar 40 horas → Debería guardar correctamente

---

## 🔧 Troubleshooting

### Error: "weekly_hours column does not exist"
**Solución:** Ejecuta el script SQL en Supabase (Paso 1)

### Error: "Hours must be between 1 and 168"
**Solución:** Ingresa un valor válido entre 1 y 168 horas

### No se actualiza el valor en la UI
**Solución:** Recarga la página (F5) después de guardar

---

## 📝 Notas Técnicas

- Las horas se almacenan como **INTEGER** en la BD
- El valor por defecto es **40 horas** para nuevos usuarios
- El rango permitido es **1-168 horas** (validado en BD y frontend)
- Los cambios se sincronizan automáticamente en la sesión del usuario
- La función `handle_new_user()` fue actualizada para incluir `weekly_hours`

---

¡Listo! Ahora tienes un sistema de tracking de tiempo completamente personalizable. 🎉
