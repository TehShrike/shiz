# shiz

values as functions and shit

It's like an observable stream, except instead of a stream of values, it's a stream of changes that you can lazily reify into values.

Originally inspired by observables-as-functions libraries like [w0w](https://github.com/m59peacemaker/w0w) or [PureState](https://github.com/MaiaVictor/PureState) or [set-state](https://github.com/AutoSponge/set-state), except that this one is aggressively lazy.

Functions are only re-run when someone asks for the value, as opposed to when a dependency's value changes.

shiz can be used as a [Svelte store](https://svelte.dev/docs#4_Prefix_stores_with_$_to_access_their_values).

## Observable example

<!--js
const shiz = require('./')
-->

```js

const { value, computed } = shiz

const itsAValue = value(5)
const anotherValue = value(3)

const dependentValue = computed(
	{ itsAValue, anotherValue },
	({ itsAValue, anotherValue }) => itsAValue + anotherValue
)

dependentValue.get() // => 8

anotherValue.set(6)
// ^ This marks dependentValue as dirty but doesn't cause it to be re-run

dependentValue.get() // => 11
// ^ This call actually causes dependentValue to be re-run
```

This aggressively lazy behavior is useful if you have values that depend on large numbers of other values, with many values being changed in a tick.

Like, say, if you're watching the viewport position of hundreds of elements while the user is scrolling around.

To listen for changes:

```js
const someValue = value(4)

someValue.set(3)
someValue.set(2)
someValue.set(1)

someValue.on('change', () => {
	someValue.get() // => 1
})
```

## API

Exports two functions, `value` and `computed`.

### `observableish = value([ value ])`

Takes any value and returns an [`observableish`](#observableish) object with a `set` function that takes a single argument.  Call `set` to change the value.

### `observableish = computed(dependencies, computeFunction)`

Takes two arguments: an object of [`observableish`](#observableish) dependencies, and a function that takes an object of values calculated from those dependencies.

Even if a bunch of upstream dependencies change, the `computeFunction` won't be called until something calls the `get` method.

```js

const a = value(1)
function computeFunction({ a }) {
	return a * 2
}
const doubled = computed({ a }, computeFunction)
```

### `observableish`

An object with these properties:

- `observableish.get()`: a function that returns the current value, recalculating it if necessary
- `observableish.map(fn)`: sugar for `computed([ observableish ], ([ value ]) => fn(value))`
- `unsubscribe = observableish.subscribe(callback)`: Calls the callback function whenever the observable value changes.  Also calls the callback function with the current value right away when subscribe is called.

It is also a [`better-emitter`](https://github.com/TehShrike/better-emitter) emitter that emits these events:

- `change`: this is the event you should subscribe to.  It will fire in a microtask after any changes happen, allowing you to recalculate values lazily.
- `dirty`: this fires *every* time an upstream value changes.  Don't call `get` every time this event fires, or else you'll cause a lot of extra recalculation.

## License

[WTFPL](http://wtfpl2.com)
