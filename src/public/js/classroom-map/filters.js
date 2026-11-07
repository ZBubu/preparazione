import { state } from './state.js';
import { getClassroomStatus } from './lessons.js';
import { updateMap } from './map.js';
import { setTimeline } from './timeline.js';

export function applyFilters() {
    const availability = state.availabilityFilter;

    state.classrooms.forEach((classroom) => {
        const polygon = document.querySelector(
            `polygon[data-id="${CSS.escape(String(classroom.id))}"]`,
        );

        if (!polygon) return;

        const status = getClassroomStatus(classroom);

        const matchesStatus = availability === 'all' || availability === status;

        polygon.style.display = matchesStatus ? '' : 'none';
    });
}

export function updateMapInfo() {
    const floor = state.currentFloor;

    const days = {
        Monday: 'Lunedì',
        Tuesday: 'Martedì',
        Wednesday: 'Mercoledì',
        Thursday: 'Giovedì',
        Friday: 'Venerdì',
    };

    const availabilityLabels = {
        all: 'Tutte le aule',
        free: 'Solo aule libere',
        occupied: 'Solo aule occupate',
    };

    const hours = String(Math.floor(state.currentTime / 60)).padStart(2, '0');
    const minutes = String(state.currentTime % 60).padStart(2, '0');

    const heading = document.getElementById('floorName');

    if (!heading) return;

    heading.textContent = [
        floor?.name ?? 'Piano sconosciuto',
        days[state.currentDay] ?? state.currentDay,
        `${hours}:${minutes}`,
        availabilityLabels[state.availabilityFilter] ?? 'Tutte le aule',
    ].join(' - ');
}

export function initFilters(loadFloor) {
    const availabilitySelect = document.getElementById('availabilityFilter');
    const resetButton = document.getElementById('resetFilters');

    availabilitySelect.value = state.availabilityFilter;

    availabilitySelect.addEventListener('change', (event) => {
        state.availabilityFilter = event.target.value;

        applyFilters();
        updateMapInfo();
    });

    resetButton.addEventListener('click', async () => {
        const defaultFloor = window.APP_CONFIG.floors[0].id;
        const defaultDay = 'Monday';
        const defaultTime = 480;

        state.availabilityFilter = 'all';
        availabilitySelect.value = 'all';

        document.getElementById('floorSelect').value = defaultFloor;

        await setTimeline(defaultDay, defaultTime);
        await loadFloor(defaultFloor);

        updateMap();
        updateMapInfo();
    });
}
async function resetFilters() {
    const defaultFloor = window.APP_CONFIG.floors[0].id;
    const defaultDay = 'Monday';
    const defaultTime = 480; // 08:00

    // Reset availability
    state.availabilityFilter = 'all';
    document.getElementById('availabilityFilter').value = 'all';

    // Reset floor selector
    document.getElementById('floorSelect').value = defaultFloor;

    // Reset day and time
    document.getElementById('daySelect').value = defaultDay;
    document.getElementById('timeSlider').value = defaultTime;

    // Reload lessons and update timeline
    await setTimeline(defaultDay, defaultTime);

    // Switch to default floor
    // Requires loadFloor() to be accessible here
    await loadFloor(defaultFloor);

    updateMap();
    updateMapInfo();
}
