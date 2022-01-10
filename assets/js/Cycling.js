import Workout from './Workout.js';

export default class Cycling extends Workout {
    #type = 'cycling';
    #elevationGain;
    #speed;
    #desc;

    constructor(coords, distance, duration, elevationGain) {
        super(coords, distance, duration);
        this.#elevationGain = elevationGain;
        this.#speed = this.#calcSpeed();
        this.#desc = this.getDescription(this.#type);
    }

    #calcSpeed() {
        return this.distance / (this.duration / 60);
    }

    get elevationGain() {
        return this.#elevationGain;
    }

    get speed() {
        return this.#speed;
    }

    get desc() {
        return this.#desc;
    }

    get type() {
        return this.#type;
    }
}
