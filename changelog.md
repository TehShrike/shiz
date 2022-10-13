# 3.0.0

- switched the `computed` interface to take an object with named observables as arguments instead of an array of positional arguments
- switched from using `process.nextTick` in node.js and `setTimeout` in the browser to using `queueMicrotask` everywhere
