let activePopover = null;

export function showClassroomDetails(classroom, lesson, element) {
    activePopover?.dispose();
    activePopover = null;

    if (!element) return;

    const content = document.createElement('div');

    const days = {
        Monday: 'Lunedì',
        Tuesday: 'Martedì',
        Wednesday: 'Mercoledì',
        Thursday: 'Giovedì',
        Friday: 'Venerdì',
    };

    function addDetail(label, value) {
        const row = document.createElement('div');
        row.className = 'mb-1';

        const strong = document.createElement('strong');
        strong.textContent = `${label}: `;

        const span = document.createElement('span');
        span.textContent = value ?? 'N/D';

        row.append(strong, span);
        content.appendChild(row);
    }

    addDetail('Stato', lesson ? 'Occupata' : 'Libera');

    if (lesson) {
        addDetail('Materia', lesson.subject);
        addDetail('Docente', lesson.teacher);
        addDetail('Classe', lesson.schoolClass);
        addDetail('Giorno', days[lesson.day] ?? lesson.day);
        addDetail('Ora inizio', lesson.startTime?.slice(0, 5));
        addDetail('Ora fine', lesson.endTime?.slice(0, 5));
    }

    activePopover = new bootstrap.Popover(element, {
        title: `Aula ${classroom.number}`,
        content: () => content,
        html: true,
        sanitize: false,
        trigger: 'manual',
        placement: 'auto',
        container: 'body',
    });

    activePopover.show();
}

export function hideClassroomDetails() {
    if (!activePopover) return;
    activePopover?.dispose();
    activePopover = null;
}
