import { generateId, getAllPropertyNames } from './utils.js';

export default class Workout {
    #date = new Date();
    #id = generateId();
    #coords;
    #distance;
    #duration;

    constructor(coords, distance, duration) {
        this.#coords = coords;
        this.#distance = distance;
        this.#duration = duration;
    }

    get id() {
        return this.#id;
    }

    get distance() {
        return this.#distance;
    }

    get duration() {
        return this.#duration;
    }

    get coords() {
        return this.#coords;
    }

    getDescription(type) {
        const options = { month: 'long', day: '2-digit' };

        return `${type[0].toUpperCase()}${type.slice(1)} on ${new Intl.DateTimeFormat(
            'en-US',
            options
        ).format(this.#date)}`;
    }

    toJSON() {
        const jsonObj = getAllPropertyNames(this).reduce((res, prop) => {
            if (prop === 'constructor' || prop === 'getDescription' || prop === 'toJSON')
                return res;

            res[prop] = this[prop];
            return res;
        }, {});

        return jsonObj;
    }
}
