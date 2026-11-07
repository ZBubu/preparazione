import { state } from './state.js';

import { getClassrooms, getLessons } from './api.js';

import { drawMap, updateMap } from './map.js';

import { initTimeline } from './timeline.js';
import { initFilters } from './filters.js';
import { initSearch } from './search.js';
import { hideClassroomDetails } from './classroom-details.js';
import { updateMapInfo } from './filters.js';

async function loadFloor(floorId) {
    const floor = window.APP_CONFIG.floors.find((f) => String(f.id) === String(floorId));

    if (!floor) {
        throw new Error(`Floor ${floorId} not found`);
    }

    const data = await getClassrooms(floor.id);

    state.currentFloor = floor;
    state.classrooms = data.classrooms;

    const floorImage = document.getElementById('floorImage');
    floorImage.src = floor.image;
    floorImage.alt = floor.name;

    state.mapSize = {
        width: data.width,
        height: data.height,
    };

    // Keep your existing map rendering and update logic
    drawMap();
    updateMap();
    updateMapInfo();
}

async function init() {
    try {
        const floors = window.APP_CONFIG.floors;

        if (!floors.length) {
            throw new Error('No floors available');
        }

        state.currentFloor = floors[0].id;

        // Load initial data
        state.lessons = await getLessons(state.currentDay);

        await loadFloor(state.currentFloor);

        // Initialize interactions
        initTimeline();
        initFilters(loadFloor);
        initSearch(loadFloor);

        document.addEventListener('click', (event) => {
            const clickedClassroom = event.target.closest('.classroom');
            const clickedPopover = event.target.closest('.popover');

            if (!clickedClassroom && !clickedPopover) {
                hideClassroomDetails();
            }
        });

        // Floor selector
        document.getElementById('floorSelect').addEventListener('change', (event) => {
            loadFloor(event.target.value).catch(console.error);
        });

        initCsvUpload();
    } catch (error) {
        console.error(error);

        document.getElementById('mapInfo').textContent = 'Unable to load the classroom map.';
    }
}

function initCsvUpload() {
    const form = document.getElementById('csvForm');
    const message = document.getElementById('uploadMessage');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const fileInput = document.getElementById('csvFile');
        const file = fileInput.files[0];
        if (!file) {
            message.textContent = 'Seleziona un file CSV.';
            return;
        }

        const formData = new FormData();
        formData.append('csv', file);
        message.textContent = 'Importazione in corso...';

        try {
            const response = await fetch('/api/lessons/upload', {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Impossibile importare il CSV.');
            }

            message.textContent = `${result.imported} lezioni importate.`;
            state.lessons = await getLessons(state.currentDay);
            updateMap();
        } catch (error) {
            message.textContent = error.message;
        }
    });
}

document.addEventListener('DOMContentLoaded', init);
