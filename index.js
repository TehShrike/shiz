const nextTick = require(`iso-next-tick`)
const makeEmitter = require(`better-emitter`)

const inherit = (parent, child) => Object.assign(Object.create(parent), child)

function value(value = null) {
	const observable = makeLazyObservable(() => value)

	return addObservableHelpers(
		inherit(observable, {
			set(newValue) {
				observable.set(() => newValue)
			},
		})
	)
}

function computed(dependencies, transform) {
	const observable = makeLazyObservable(calculate)

	function calculate() {
		const dependencyValues = dependencies.map(observable => observable.get())
		return transform(dependencyValues)
	}

	function setDirty() {
		observable.set(calculate)
	}

	dependencies.forEach(observable => {
		observable.on(`dirty`, setDirty)
	})

	return addObservableHelpers(
		inherit(observable, {
			set() {
				throw new Error(`Can't set a computed observable`)
			},
		})
	)
}

module.exports = {
	value,
	computed,
}

function addObservableHelpers(observable) {
	return inherit(observable, {
		map(fn) {
			return computed([ observable ], ([ value ]) => fn(value))
		},
	})
}

function makeLazyObservable(calculateFunction) {
	let computedValue = calculateFunction()
	let dirty = false
	let needToEmitChange = true

	function setDirty() {
		if (!dirty) {
			dirty = true

			emitter.emit(`dirty`)

			if (needToEmitChange) {
				needToEmitChange = false

				nextTick(() => {
					needToEmitChange = true
					emitter.emit(`change`)
				})
			}
		}
	}

	const emitter = makeEmitter({
		get() {
			if (dirty) {
				computedValue = calculateFunction()
				dirty = false
			}

			return computedValue
		},
		set(newCalculateFunction) {
			calculateFunction = newCalculateFunction
			setDirty()
		},
	})

	return emitter
}
