export function toMinutes(time) {
    if (typeof time !== 'string') {
        console.warn('Invalid time:', time);
        return NaN;
    }

    const [hours, minutes] = time.split(':').map(Number);

    return hours * 60 + minutes;
}

export function toTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

export function normalizeDay(day) {
    const normalized = (day || '').trim().toLowerCase();
    const dayAliases = {
        lun: 'lun',
        monday: 'lun',
        mon: 'lun',
        mar: 'mar',
        tuesday: 'mar',
        tue: 'mar',
        mer: 'mer',
        mercoledi: 'mer',
        wednesday: 'mer',
        wed: 'mer',
        gio: 'gio',
        giovedi: 'gio',
        thursday: 'gio',
        thu: 'gio',
        ven: 'ven',
        venerdi: 'ven',
        friday: 'ven',
        fri: 'ven',
        sab: 'sab',
        sabato: 'sab',
        saturday: 'sab',
        sat: 'sab',
        dom: 'dom',
        domenica: 'dom',
        sunday: 'dom',
        sun: 'dom',
    };

    const key = normalized.slice(0, 3);
    return dayAliases[normalized] || dayAliases[key] || key;
}
