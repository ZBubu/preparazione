import { state } from './state.js';
import { getLessons } from './api.js';
import { updateMap } from './map.js';
import { applyFilters, updateMapInfo } from './filters.js';

export function initTimeline() {
    const daySelect = document.getElementById('daySelect');
    const timeSlider = document.getElementById('timeSlider');

    daySelect.addEventListener('change', async (event) => {
        state.currentDay = event.target.value;
        state.lessons = await getLessons(state.currentDay);
        setCurrentTime(state.currentTime);
    });

    timeSlider.addEventListener('input', (event) => {
        state.currentTime = Number(event.target.value);
        updateMap();
    });

    document.getElementById('nowButton').addEventListener('click', async () => {
        const now = new Date();

        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        const day = days[now.getDay()];
        const minutes = now.getHours() * 60 + now.getMinutes();

        // Load lessons for the current day
        state.currentDay = day;
        document.getElementById('daySelect').value = day;

        state.lessons = await getLessons(day);

        setCurrentTime(minutes);
    });

    document.getElementById('timeSlider').addEventListener('input', (event) => {
        setCurrentTime(event.target.value);
    });
}

export function setCurrentTime(minutes) {
    const value = Number(minutes);

    if (!Number.isFinite(value)) {
        console.error('Invalid timeline value:', minutes);
        return;
    }

    state.currentTime = value;

    const hours = String(Math.floor(value / 60)).padStart(2, '0');
    const mins = String(value % 60).padStart(2, '0');

    document.getElementById('timeSlider').value = value;
    document.getElementById('timeDisplay').textContent = `${hours}:${mins}`;

    updateMap();
    applyFilters();
    updateMapInfo();
}

export async function setTimeline(day, time) {
    const minutes = Number(time);

    if (!Number.isFinite(minutes)) {
        console.error('Invalid timeline time:', time);
        return;
    }

    state.currentDay = day;
    state.currentTime = minutes;

    document.getElementById('daySelect').value = day;
    document.getElementById('timeSlider').value = minutes;

    const hh = String(Math.floor(minutes / 60)).padStart(2, '0');
    const mm = String(minutes % 60).padStart(2, '0');

    document.getElementById('timeDisplay').textContent = `${hh}:${mm}`;

    state.lessons = await getLessons(day);

    updateMap();
    updateMapInfo();
}
