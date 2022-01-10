import Workout from './Workout.js';

export default class Running extends Workout {
    #type = 'running';
    #cadence;
    #pace;
    #desc;

    constructor(coords, distance, duration, cadence) {
        super(coords, distance, duration);
        this.#cadence = cadence;
        this.#pace = this.#calcPace();
        this.#desc = this.getDescription(this.#type);
    }

    #calcPace() {
        return this.duration / this.distance;
    }

    get cadence() {
        return this.#cadence;
    }

    get pace() {
        return this.#pace;
    }

    get desc() {
        return this.#desc;
    }

    get type() {
        return this.#type;
    }
}
