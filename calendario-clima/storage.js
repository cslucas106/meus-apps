const STORAGE_KEY = 'calendario_clima_events_v1';

function getStoredEvents() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : {};
    } catch {
        return {};
    }
}

function saveStoredEvents(events) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch (e) {
        console.error('Erro ao salvar eventos', e);
    }
}