# 🛡️ Grumpi: The Game (v2.0.26-STABLE)

### **Grumpi Network Protocol • Trading Card Game (TCG) & Move-to-Earn**

![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?style=for-the-badge&logo=react)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)
![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?style=for-the-badge&logo=sqlite)
![Tailwind](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

**Grumpi** no es solo un juego de cartas coleccionables; es un ecosistema de exploración física. Diseñado exclusivamente para dispositivos móviles, el sistema utiliza el conteo de pasos real del usuario para desbloquear recompensas y expandir su biblioteca de criaturas.

---

## 🚀 Características Principales

- **Move-to-Earn (Pedometer Integration):** Desbloquea diferentes tipos de sobres (Bronce, Solaris) según tu actividad física diaria.
- **Gestión de Biblioteca:** Colecciona hasta 160 Grumpis únicos con estadísticas personalizadas (PS, ataques, tipos).
- **Grumpi Compañero:** Selecciona a tu carta favorita para que te acompañe y se muestre en tu perfil global de entrenador.
- **Seguridad de Nivel Militar:** Autenticación de usuarios mediante hash de contraseñas (Bcrypt) y persistencia en base de datos relacional.
- **UI/UX Cyberpunk:** Interfaz optimizada para móviles con efectos de desenfoque de fondo (Glassmorphism) y animaciones fluidas.

---

## 🏗️ Arquitectura del Sistema

El proyecto sigue una estructura desacoplada para garantizar la escalabilidad:

### **Backend (Python 3.12 + FastAPI)**

- **Models:** Definición de tablas relacionales con SQLAlchemy.
- **Services:** Lógica de negocio (apertura de sobres, validación de 24h, cálculos de nivel).
- **Schemas:** Validación de datos de entrada/salida con Pydantic.
- **Database:** Persistencia local ligera con SQLite.

### **Frontend (React + TypeScript)**

- **Vite:** Herramienta de construcción ultra rápida.
- **Tailwind CSS:** Diseño responsivo y moderno basado en utilidades.
- **API Service:** Capa de comunicación centralizada para peticiones asíncronas.

---

## 🛠️ Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone [https://github.com/tu-usuario/grumpis-game.git](https://github.com/tu-usuario/grumpis-game.git)
cd grumpis-game

Comando para arrancar backend:

python -m uvicorn main:app --reload
```
