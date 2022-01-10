'use strict';

import Cycling from './Cycling.js';
import Running from './Running.js';
import { validInputs, positiveNumbers } from './utils.js';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const clearLink = document.querySelector('.clear_link a');

class App {
    #map;
    #mapZoomLevel = 13;
    #currentMarker;
    #workouts = [];

    constructor() {
        this.#loadMap();

        form.addEventListener('submit', this.#newWorkout.bind(this));

        inputType.addEventListener('change', this.#toggleInputField);

        containerWorkouts.addEventListener('click', this.#moveToMap.bind(this));

        clearLink.addEventListener('click', this.#resetWorkoutList);
    }

    async #getPosition() {
        if (navigator.geolocation) {
            const {
                coords: { latitude: lat, longitude: lng },
            } = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });

            return [lat, lng];
        }
    }

    async #loadMap() {
        try {
            const coordinate = await this.#getPosition();

            this.#map = L.map('map').setView(coordinate, this.#mapZoomLevel);

            L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
                attribution:
                    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(this.#map);

            this.#newMarker(coordinate).#showPopup('Your current position!');
            this.#currentMarker = null;

            this.#getStorage();

            this.#map.on('click', this.#showForm.bind(this));
        } catch (e) {
            console.log(e);
            alert('Could not get your location! 😢');
        }
    }

    #showForm(mapEvent) {
        const { lat, lng } = mapEvent.latlng;

        this.#newMarker([lat, lng]);

        form.classList.remove('hidden');
        inputDistance.focus();
    }

    #hideForm() {
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';
        form.classList.add('hidden');
    }

    #toggleInputField() {
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    }

    #newMarker(coordinate) {
        this.#currentMarker && this.#map.removeLayer(this.#currentMarker);

        this.#currentMarker = L.marker(coordinate).addTo(this.#map);

        return this;
    }

    #newWorkout(e) {
        e.preventDefault();

        if (!this.#currentMarker) return alert('Please select a marker!');

        let workout;
        const type = form.elements['type'].value;
        const distance = +form.elements['distance'].value;
        const duration = +form.elements['duration'].value;
        const { lat, lng } = this.#currentMarker.getLatLng();

        if (type === 'running') {
            const cadence = +form.elements['cadence'].value;

            if (
                !validInputs(distance, duration, cadence) ||
                !positiveNumbers(distance, duration, cadence)
            )
                return alert('Inputs have to be positive numbers!');

            workout = new Running([lat, lng], distance, duration, cadence);
        }

        if (type === 'cycling') {
            const elevation = +form.elements['elevation'].value;

            if (!validInputs(distance, duration, elevation) || !positiveNumbers(distance, duration))
                return alert('Inputs have to be positive numbers!');

            workout = new Cycling([lat, lng], distance, duration, elevation);
        }

        this.#workouts.push(workout);

        this.#showPopup(`${workout.desc}`, type);

        this.#renderWorkoutList(workout);

        this.#currentMarker = null;

        this.#hideForm();

        this.#setStorage();
    }

    #showPopup(content, type) {
        this.#currentMarker
            .bindPopup(
                L.popup({
                    maxWidth: 250,
                    minWidth: 100,
                    autoClose: false,
                    closeOnClick: false,
                    className: `${type || 'position'}-popup`,
                }).setContent(`${content}`)
            )
            .openPopup();
    }

    #renderWorkoutList(workout) {
        let html = `
            <li class="workout workout--${workout.type}" data-id="${workout.id}">
                <h2 class="workout__title">${workout.desc}</h2>
                <div class="workout__details">
                    <span class="workout__icon">${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}</span>
                    <span class="workout__value">${workout.distance}</span>
                    <span class="workout__unit">km</span>
                </div>
                <div class="workout__details">
                    <span class="workout__icon">⏱</span>
                    <span class="workout__value">${workout.duration}</span>
                    <span class="workout__unit">min</span>
                </div>
        `;

        if (workout.type === 'running') {
            html += `
                <div class="workout__details">
                    <span class="workout__icon">⚡️</span>
                    <span class="workout__value">${workout.pace.toFixed(1)}</span>
                    <span class="workout__unit">min/km</span>
                </div>
                <div class="workout__details">
                    <span class="workout__icon">🦶🏼</span>
                    <span class="workout__value">${workout.cadence}</span>
                    <span class="workout__unit">spm</span>
                </div> 
            </li>               
            `;
        }

        if (workout.type === 'cycling') {
            html += `
                <div class="workout__details">
                    <span class="workout__icon">⚡️</span>
                    <span class="workout__value">${workout.speed.toFixed(1)}</span>
                    <span class="workout__unit">km/h</span>
                </div>
                <div class="workout__details">
                    <span class="workout__icon">⛰</span>
                    <span class="workout__value">${workout.elevationGain}</span>
                    <span class="workout__unit">m</span>
                </div>   
            </li>             
            `;
        }

        clearLink.closest('.clear_link').classList.remove('hidden');
        form.insertAdjacentHTML('afterend', html);
    }

    #moveToMap(e) {
        if (!this.#map) return;

        const workoutEl = e.target.closest('.workout');

        if (!workoutEl) return;

        const workout = this.#workouts.find(el => el.id === workoutEl.dataset.id);

        this.#map.setView(workout.coords, this.#mapZoomLevel, {
            animate: true,
            pan: {
                duration: 1,
            },
        });
    }

    #setStorage() {
        localStorage.setItem('workouts', JSON.stringify(this.#workouts));
    }

    #getStorage() {
        const workouts = JSON.parse(localStorage.getItem('workouts'));

        if (!workouts) {
            clearLink.closest('.clear_link').classList.add('hidden');
            return;
        }

        this.#workouts = workouts;

        this.#workouts.forEach(el => {
            this.#renderWorkoutList(el);
            this.#newMarker(el.coords).#showPopup(el.desc, el.type);
            this.#currentMarker = null;
        });
    }

    #resetWorkoutList() {
        localStorage.removeItem('workouts');
    }
}

const app = new App();
