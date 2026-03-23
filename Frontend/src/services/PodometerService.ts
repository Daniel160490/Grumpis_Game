import { api } from './api';

class PedometerService {
    private lastX = 0;
    private lastY = 0;
    private lastZ = 0;
    private threshold = 12.5; // Sensibilidad: un valor entre 10 y 15 suele ser un paso
    private username: string | null = null;
    private isRunning = false;

    constructor() {
        this.username = localStorage.getItem('grumpi_user');
    }

    public async start() {
        if (this.isRunning) return;

        if (window.DeviceMotionEvent) {
            // 1. Activar el Sensor
            window.addEventListener('devicemotion', (event) => this.handleMotion(event), true);
            this.isRunning = true;
            console.log("[Grumpi OS] Sensores de movimiento vinculados.");

            // 2. Intentar Wake Lock para que no se duerma en el bolsillo
            if ('wakeLock' in navigator) {
                try {
                    await (navigator as any).wakeLock.request('screen');
                    console.log("[Grumpi OS] Wake Lock Activo.");
                } catch (err) {
                    console.warn("Wake Lock no permitido por el sistema.");
                }
            }

            // 3. Sincronización periódica cada 2 minutos si hay pasos
            setInterval(() => this.syncWithBackend(), 120000);
        } else {
            alert("Tu dispositivo no tiene acelerómetro compatible.");
        }
    }

    private handleMotion(event: DeviceMotionEvent) {
        const acc = event.accelerationIncludingGravity;
        if (!acc) return;

        // Fórmula básica de detección de picos de movimiento
        const deltaX = Math.abs(this.lastX - (acc.x || 0));
        const deltaY = Math.abs(this.lastY - (acc.y || 0));
        const deltaZ = Math.abs(this.lastZ - (acc.z || 0));

        if (deltaX + deltaY + deltaZ > this.threshold) {
            // Guardamos en local para no perder pasos si se refresca la pestaña
            const currentTemp = Number(localStorage.getItem('temp_steps') || 0);
            localStorage.setItem('temp_steps', String(currentTemp + 1));

            // Pequeño debounce manual
            this.lastX = acc.x || 0;
            this.lastY = acc.y || 0;
            this.lastZ = acc.z || 0;
        }
    }

    private async syncWithBackend() {
        const stepsToSync = Number(localStorage.getItem('temp_steps') || 0);
        this.username = localStorage.getItem('grumpi_user');

        if (stepsToSync > 0 && this.username) {
            try {
                console.log(`[Grumpi OS] Sincronizando ${stepsToSync} pasos...`);
                await api.updateSteps(this.username, stepsToSync);
                localStorage.setItem('temp_steps', '0'); // Reset tras éxito
            } catch (e) {
                console.error("Fallo de red en sincronización de pasos.");
            }
        }
    }
}

export const pedometer = new PedometerService();