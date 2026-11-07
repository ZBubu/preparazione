import { setTimeline } from './timeline.js';
import { selectClassroom } from './map.js';
import { state } from './state.js';
let searchTimer;
let controller;
let loadSearchFloor;

export function initSearch(loadFloor) {
    loadSearchFloor = loadFloor;
    const input = document.getElementById('searchInput');
    const day = document.getElementById('searchDay');
    const time = document.getElementById('searchTime');
    const floor = document.getElementById('searchFloor');
    const exactTime = document.getElementById('searchExactTime');
    const modes = document.querySelectorAll('[name="searchMode"]');

    console.log(window.APP_CONFIG.floors);
    console.log(state.classrooms[0]);

    // Initialize search filters from the current map state
    day.value = state.currentDay;

    const hh = String(Math.floor(state.currentTime / 60)).padStart(2, '0');
    const mm = String(state.currentTime % 60).padStart(2, '0');
    time.value = `${hh}:${mm}`;

    function scheduleSearch() {
        clearTimeout(searchTimer);
        controller?.abort();

        const query = input.value.trim();

        if (!query) {
            clearSearchResults();
            return;
        }

        searchTimer = setTimeout(performSearch, 300);
    }

    input.addEventListener('input', scheduleSearch);

    [day, time, floor, exactTime].forEach((element) => {
        element.addEventListener('change', scheduleSearch);
    });

    modes.forEach((radio) => {
        radio.addEventListener('change', () => {
            const mode = document.querySelector('[name="searchMode"]:checked').value;

            input.placeholder = {
                classroom: 'Numero aula...',
                subject: 'Nome materia...',
                teacher: 'Nome docente...',
            }[mode];

            scheduleSearch();
        });
    });
}

async function performSearch() {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) return;

    const mode = document.querySelector('[name="searchMode"]:checked').value;

    const params = new URLSearchParams({
        mode,
        q: query,
        day: document.getElementById('searchDay').value,
        time: document.getElementById('searchTime').value,
        floor: document.getElementById('searchFloor').value,
        exactTime: document.getElementById('searchExactTime').checked,
    });

    controller?.abort();
    const request = new AbortController();
    controller = request;

    try {
        const response = await fetch(`/api/search?${params}`, {
            signal: request.signal,
        });

        if (!response.ok) {
            throw new Error('Search failed');
        }

        const results = await response.json();

        if (request.signal.aborted) return;

        renderResults(results, mode);
    } catch (error) {
        if (error.name !== 'AbortError') {
            console.error(error);
            document.getElementById('noResults').textContent = 'Errore durante la ricerca';
        }
    }
}

function clearSearchResults() {
    document.getElementById('searchResults')?.replaceChildren();

    const info = document.getElementById('noResults');
    if (info) info.textContent = '';
}

function renderResults(results, mode) {
    const container = document.getElementById('searchResults');
    const info = document.getElementById('noResults');

    container.replaceChildren();

    const items = mode === 'classroom' ? (results.classrooms ?? []) : (results.lessons ?? []);

    if (info) {
        info.textContent = items.length
            ? `${items.length} risultati trovati`
            : 'Nessun risultato trovato';
    }

    const days = {
        Monday: 'Lunedì',
        Tuesday: 'Martedì',
        Wednesday: 'Mercoledì',
        Thursday: 'Giovedì',
        Friday: 'Venerdì',
    };

    for (const item of items) {
        const li = document.createElement('li');
        li.className = 'search-result';

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'search-result-card';

        const header = document.createElement('div');
        header.className = 'search-result-header';

        const title = document.createElement('strong');
        const badge = document.createElement('span');

        badge.className = 'search-result-room';

        if (mode === 'classroom') {
            title.textContent = `Aula ${item.number}`;

            badge.textContent = item.status === 'occupied' ? 'Occupata' : 'Libera';

            badge.className = `badge ${item.status === 'occupied' ? 'bg-danger' : 'bg-success'}`;

            const description = document.createElement('div');
            description.className = 'search-result-subtitle';

            description.textContent = item.currentLesson
                ? `${item.currentLesson.subject} · ${item.currentLesson.teacher}`
                : 'Nessuna lezione in corso';

            header.append(title, badge);
            button.append(header, description);

            button.addEventListener('click', async () => {
                const [hours, minutes] = document
                    .getElementById('searchTime')
                    .value.split(':')
                    .map(Number);

                await navigateToClassroom(
                    item,
                    document.getElementById('searchDay').value,
                    hours * 60 + minutes,
                );

                // Close search results after selection
                document.getElementById('searchResults')?.replaceChildren();
            });
        } else {
            title.textContent = item.subject;

            badge.textContent = `Aula ${item.classroom?.number ?? 'N/D'}`;

            const description = document.createElement('div');
            description.className = 'search-result-subtitle';

            description.textContent =
                `${item.teacher} · ${item.schoolClass} · ` +
                `${days[item.day] ?? item.day} · ` +
                `${item.startTime.slice(0, 5)}–${item.endTime.slice(0, 5)}`;

            header.append(title, badge);
            button.append(header, description);

            button.addEventListener('click', async () => {
                await selectSearchResult({
                    type: 'lesson',
                    data: item,
                });
            });
        }

        li.appendChild(button);
        container.appendChild(li);
    }
}

async function navigateToClassroom(classroom, day, minutes) {
    const floorId = classroom.floorId;

    if (floorId == null) {
        throw new Error('Classroom floorId is missing');
    }

    if (String(state.currentFloor?.id) !== String(floorId)) {
        await loadSearchFloor(floorId);
    }

    const floorSelect = document.getElementById('floorSelect');

    if (floorSelect) {
        floorSelect.value = String(floorId);
    }

    await setTimeline(day, minutes);

    selectClassroom(classroom.id);
}

async function selectSearchResult(result) {
    if (result.type !== 'lesson') return;

    const lesson = result.data;

    try {
        // Convert HH:mm:ss into minutes since midnight
        const [hours, minutes] = lesson.startTime.split(':').map(Number);

        const timeInMinutes = hours * 60 + minutes;

        if (!Number.isFinite(timeInMinutes)) {
            throw new Error(`Invalid lesson time: ${lesson.startTime}`);
        }

        // Update day, time, lessons and map
        await navigateToClassroom(lesson.classroom, lesson.day, timeInMinutes);

        // Select the classroom
        selectClassroom(lesson.classroomId);

        // Close search results
        document.getElementById('searchResults')?.replaceChildren();

        // Update search input
        const input = document.getElementById('searchInput');

        if (input) {
            input.value = `${lesson.subject} - ${lesson.teacher}`;
            input.setAttribute('aria-expanded', 'false');
        }
    } catch (error) {
        console.error('Unable to select lesson:', error);
    }
}
