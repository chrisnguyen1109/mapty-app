export const generateId = () =>
    Math.floor(Math.random() * 10) + (Date.now() + '').slice(-8) + Math.floor(Math.random() * 10);

export const validInputs = (...inputs) => inputs.every(el => Number.isFinite(el));

export const positiveNumbers = (...nums) => nums.every(el => el > 0);

export const getAllPropertyNames = obj => {
    const ownProps = Object.getPrototypeOf(obj);
    const inheritProps = Object.getPrototypeOf(ownProps);

    return [
        ...new Set(
            Object.getOwnPropertyNames(ownProps).concat(Object.getOwnPropertyNames(inheritProps))
        ),
    ];
};
