# MacroWolk ⚔️ - WoW 3.3.5a & Ascension Macro Builder

Constructor visual interactivo y generador de macros avanzadas para World of Warcraft (WotLK 3.3.5a y Project Ascension).

## 🚀 Características

- **Diseñador Visual de Macros**: Construye macros complejas bloque a bloque (`/cast`, `/use`, `/petattack`, `/cancelaura`, `/stopcasting`, etc.).
- **Editor de Condiciones Inteligente**: Configura modificadores (`[mod:shift]`, `[combat]`, `[stealth]`) y selección de objetivos (`@target`, `@mouseover`, `@focus`, `@player`, etc.).
- **Simulador en Tiempo Real**: Prueba tus macros cambiando el estado del jugador, objetivo y modificadores con feedback visual inmediato.
- **Hub de Arquetipos (Project Ascension)**: Presets y configuraciones listas para combinaciones híbridas y builds meta.
- **Importador y Exportador**: Pega macros existentes de WoW para convertirlas en bloques visuales o exporta tu código listo para el juego.

---

## 🛠️ Tecnologías

- **React 18** + **TypeScript**
- **Vite**
- **Tailwind CSS**
- **Lucide Icons** & **Canvas Confetti**
- **Nginx** + **Docker**

---

## 💻 Desarrollo Local

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Iniciar servidor de desarrollo:
   ```bash
   npm run dev
   ```

3. Compilar para producción:
   ```bash
   npm run build
   ```

---

## 🐳 Despliegue en VPS con Coolify

Este proyecto está 100% preparado para ser desplegado en tu VPS con **Coolify**:

1. En tu panel de Coolify, crea un nuevo **Application**.
2. Selecciona tu repositorio de GitHub (`https://github.com/Franquinro/macros.git`).
3. Selecciona **Dockerfile** o **Docker Compose** como método de despliegue.
4. Coolify compilará la imagen en varias etapas y levantará el servidor Nginx en el puerto 80 automáticamente.
