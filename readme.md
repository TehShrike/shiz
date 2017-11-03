# shiz

values as functions and shit

It's an observables-as-functions library like [w0w](https://github.com/m59peacemaker/w0w) or [PureState](https://github.com/MaiaVictor/PureState) or [set-state](https://github.com/AutoSponge/set-state), except that this one is aggressively lazy.

Functions are only re-run when someone asks for the value, as opposed to when a dependency's value changes.

## Observable example

<!--js
const shiz = require('./')
-->

```js

const itsAValue = shiz(5)
const anotherValue = shiz(() => 3) // like the above, except calculated lazily

const dependentValue = shiz(() => itsAValue() + anotherValue())

dependentValue() // => 8

anotherValue.set(() => itsAValue() + 1)
// ^ This marks dependentValue as dirty but doesn't cause it to be re-run

dependentValue() // => 11
// ^ This call actually causes dependentValue to be re-run
```

This aggressively lazy behavior is useful if you haev values that depend on large numbers of other values, with many values being changed in a tick.

Like, say, if you're watching the viewport position of hundreds of elements while the user is scrolling around.

To listen for changes:

```js
const someValue = shiz(4)

someValue.set(3)
someValue.set(2)
someValue.set(1)

someValue.onChange(() => {
	someValue() // => 1
})
```

## API

### `lazyValue = shiz(function | value)`

Pass in a function or a value.  Functions will be evaluated once right away to determine any values they depend on.

### `lazyValue()`

Returns the current value.  Doesn't re-run the input function, or any dependency value functions, unless an upstream value has changed.

### `lazyValue.set(function | value)`

Sets a new value.  It will be evaluated immediately.  Downstream values will not be updated until their value is asked for.

### `lazyValue.onChange(callbackFunction)`

The callback function will be called on the next tick after a change occurs.

## License

[WTFPL](http://wtfpl2.com)

## todo?

- consider making the package smaller by introducing a small amount of complexity to remove dependencies
	- key-master
	- better-emitter
