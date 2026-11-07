import { state } from './state.js';
import { getLesson, getClassroomStatus } from './lessons.js';
import { showClassroomDetails, hideClassroomDetails } from './classroom-details.js';
import { applyFilters } from './filters.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

export function drawMap() {
    const svg = document.createElementNS(SVG_NS, 'svg');

    svg.setAttribute('viewBox', `0 0 ${state.mapSize.width} ${state.mapSize.height}`);

    state.classrooms.forEach((classroom) => {
        const polygon = document.createElementNS(SVG_NS, 'polygon');

        polygon.setAttribute('points', classroom.points.map((point) => point.join(',')).join(' '));

        polygon.dataset.id = classroom.id;
        polygon.classList.add('classroom');

        polygon.addEventListener('click', (event) => {
            event.stopPropagation();
            selectClassroom(classroom.id);
        });

        svg.appendChild(polygon);

        // Classroom number
        const text = document.createElementNS(SVG_NS, 'text');

        const centerX =
            classroom.points.reduce((sum, point) => sum + point[0], 0) / classroom.points.length;

        const centerY =
            classroom.points.reduce((sum, point) => sum + point[1], 0) / classroom.points.length;

        text.setAttribute('x', centerX);
        text.setAttribute('y', centerY);
        text.classList.add('room-label');
        text.textContent = classroom.number;

        svg.appendChild(text);
    });

    const overlay = document.getElementById('mapOverlay');

    overlay.replaceChildren(svg);

    updateMap();
}

export function updateMap() {
    state.classrooms.forEach((classroom) => {
        const polygon = document.querySelector(`polygon[data-id="${classroom.id}"]`);

        if (!polygon) return;

        const status = getClassroomStatus(classroom);

        // Update classroom color
        if (status === 'occupied') {
            polygon.setAttribute('fill', '#d64c3a');
        } else {
            polygon.setAttribute('fill', '#2ea078');
        }

        // Apply availability filter
        const filter = state.availabilityFilter;

        const visible =
            filter === 'all' ||
            (filter === 'free' && status === 'free') ||
            (filter === 'occupied' && status === 'occupied');

        polygon.style.display = visible ? '' : 'none';
    });
    applyFilters();
}

export function selectClassroom(id) {
    const classroom = state.classrooms.find((c) => String(c.id) === String(id));

    if (!classroom) return;

    const polygon = document.querySelector(
        `#mapOverlay polygon[data-id="${CSS.escape(String(classroom.id))}"]`,
    );

    if (!polygon) {
        console.warn('Polygon not found:', classroom.id);
        return;
    }

    const toMinutes = (time) => {
        const [hours, minutes] = String(time).split(':').map(Number);
        return hours * 60 + minutes;
    };

    const lesson = state.lessons.find(
        (l) =>
            String(l.classroomId) === String(classroom.id) &&
            l.day === state.currentDay &&
            toMinutes(l.startTime) <= state.currentTime &&
            toMinutes(l.endTime) > state.currentTime,
    );

    state.selectedClassroom = classroom.id;

    updateMap();

    showClassroomDetails(classroom, lesson, polygon);
}

export function createClassroomDetails(classroom) {
    const container = document.createElement('div');

    const days = {
        Monday: 'Lunedì',
        Tuesday: 'Martedì',
        Wednesday: 'Mercoledì',
        Thursday: 'Giovedì',
        Friday: 'Venerdì',
    };

    const toMinutes = (time) => {
        const [hours, minutes] = String(time).split(':').map(Number);
        return hours * 60 + minutes;
    };

    const lesson = state.lessons.find(
        (l) =>
            String(l.classroomId) === String(classroom.id) &&
            l.day === state.currentDay &&
            toMinutes(l.startTime) <= state.currentTime &&
            toMinutes(l.endTime) > state.currentTime,
    );

    const table = document.createElement('table');
    table.className = 'table table-sm table-borderless mb-0';

    function addRow(label, value) {
        const tr = document.createElement('tr');

        const th = document.createElement('th');
        th.scope = 'row';
        th.className = 'pe-3 text-nowrap';
        th.textContent = label;

        const td = document.createElement('td');
        td.textContent = value ?? 'N/D';

        tr.append(th, td);
        table.appendChild(tr);
    }

    addRow('Aula:', classroom.number);
    addRow('Stato:', lesson ? 'Occupata' : 'Libera');
    addRow('Giorno:', days[state.currentDay] ?? state.currentDay);

    if (lesson) {
        addRow('Materia:', lesson.subject);
        addRow('Docente:', lesson.teacher);
        addRow('Classe:', lesson.schoolClass);
        addRow('Ora inizio:', lesson.startTime?.slice(0, 5));
        addRow('Ora fine:', lesson.endTime?.slice(0, 5));
    }

    container.appendChild(table);

    return container;
}
