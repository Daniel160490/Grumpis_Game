const API_URL = 'http://localhost:8000';

export const api = {
    // Registro de nuevo Entrenador
    register: async (username: string, password: string) => {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Error en el registro');
        }

        return await response.json(); // Devuelve el UserOut (con sus 3 Grumpis)
    },

    // Login (Próximamente con JWT)
    login: async (username: string, password: string) => {
        // Por ahora una validación simple contra el backend
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) throw new Error('Credenciales incorrectas');
        return await response.json();
    },

    getUserCollection: async (username: string) => {
        const response = await fetch(`${API_URL}/user/collection/${username}`);
        if (!response.ok) throw new Error('No se pudo obtener la biblioteca');
        return await response.json(); // { unlocked_grumpis: [1, 2, 3] }
    },

    updateFavorite: async (username: string, grumpi_id: number) => {
        await fetch(`${API_URL}/user/favorite`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, grumpi_id }),
        });
    },

    addGrumpitoCollection: async (username: string, grumpi_id: number) => {
        const response = await fetch(`${API_URL}/user/add-grumpi`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, grumpi_id }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Error al guardar el Grumpi');
        }

        return await response.json();
    },


    updateSteps: async (username: string, steps: number) => {
        const response = await fetch(`${API_URL}/user/update-steps`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, steps }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Error al sincronizar pasos');
        }

        return await response.json();
    },
};