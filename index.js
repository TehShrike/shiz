const nextTick = require('iso-next-tick')
const makeEmitter = require('better-emitter')

const { watchFunction, getFunctionsThatRelyOn } = require('./watch-function-dependencies.js')

const makeFunction = value => typeof value === 'function' ? value : () => value

module.exports = function shiz(originalInput = null) {
	let valueFn = makeFunction(originalInput)
	let needToEmitChange = true
	let dirty = true
	let calculatedValue
	const representativeObject = { setDirty }

	const changeValue = newInput => {
		valueFn = makeFunction(newInput)
	}

	function setDirty() {
		if (!dirty) {
			dirty = true
			console.log(`functions that rely on ${mainFunction.label} directly:`, getFunctionsThatRelyOn(representativeObject).map(({ label }) => label))
			getFunctionsThatRelyOn(representativeObject).forEach(({ setDirty }) => setDirty())

			if (needToEmitChange) {
				nextTick(() => emitter.emit('change'))
				needToEmitChange = false
			}
		}
	}

	const emitter = makeEmitter()

	emitter.on('change', () => {
		needToEmitChange = true
	})

	function set(newInput) {
		changeValue(newInput)
		console.log(`changed value of ${mainFunction.label} to`, newInput)
		setDirty()
	}

	const mainFunction = watchFunction(() => {
		if (dirty) {
			calculatedValue = valueFn()
			console.log(`${mainFunction.label} recalculated its value, it is now`, calculatedValue)
			dirty = false
		} else {
			console.log(`${mainFunction.label} returning previously calculated value`, calculatedValue)
		}

		return calculatedValue
	}, representativeObject)

	mainFunction.setDirty = setDirty
	mainFunction.onChange = cb => emitter.on('change', cb)
	mainFunction.set = set

	mainFunction()

	return mainFunction
}
