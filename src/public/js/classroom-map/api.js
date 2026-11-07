export async function getClassrooms(floorId) {
    const response = await fetch(`/api/classrooms?floorId=${encodeURIComponent(floorId)}`);

    if (!response.ok) {
        throw new Error('Unable to load classrooms');
    }

    return response.json();
}

export async function getLessons(day) {
    const response = await fetch(`/api/lessons?day=${encodeURIComponent(day)}`);

    if (!response.ok) {
        throw new Error('Unable to load lessons');
    }

    return response.json();
}
