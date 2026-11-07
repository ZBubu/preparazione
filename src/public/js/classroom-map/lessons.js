import { state } from './state.js';
import { toMinutes } from './utils.js';

export function getLesson(classroomId) {
    return state.lessons.find(
        (lesson) =>
            Number(lesson.classroomId) === Number(classroomId) &&
            lesson.day === state.currentDay &&
            toMinutes(lesson.startTime) <= state.currentTime &&
            state.currentTime < toMinutes(lesson.endTime),
    );
}

export function getClassroomStatus(classroom) {
    return getLesson(classroom.id) ? 'occupied' : 'free';
}
