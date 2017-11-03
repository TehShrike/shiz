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
	const emitter = makeEmitter()

	const calculateValueFunction = watchFunction(() => valueFn(), representativeObject)

	function setDirty() {
		if (!dirty) {
			dirty = true
			getFunctionsThatRelyOn(representativeObject).forEach(({ setDirty }) => setDirty())

			if (needToEmitChange) {
				nextTick(() => emitter.emit('change'))
				needToEmitChange = false
			}
		}
	}

	function recalculateValue() {
		calculatedValue = calculateValueFunction()
		dirty = false
	}

	function getValue() {
		if (dirty) {
			recalculateValue()
		} else {
			calculateValueFunction.signalThatFunctionWasRunWithoutRecalculating()
		}

		return calculatedValue
	}

	emitter.on('change', () => {
		needToEmitChange = true
	})

	getValue.onChange = cb => emitter.on('change', cb)
	getValue.set = newInput => {
		valueFn = makeFunction(newInput)
		setDirty()
		recalculateValue()
	}

	getValue()

	return getValue
}
