# 4.0.0

- converted from CommonJS to ESM
- added type definition
- in order to get closer to the Svelte store contract, `subscribe` callbacks are called synchronously when `subscribe` is first called

# 3.0.0

- switched the `computed` interface to take an object with named observables as arguments instead of an array of positional arguments
- switched from using `process.nextTick` in node.js and `setTimeout` in the browser to using `queueMicrotask` everywhere
