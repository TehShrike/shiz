const nextTick = require('iso-next-tick')
const makeEmitter = require('better-emitter')
const keyMaster = require('key-master')

const makeFunction = value => typeof value === 'function' ? value : () => value

// need to maintain a map of functions to the functions they depend on

const functionsToTheFunctionsThatRelyOnThem = keyMaster(() => new Set(), new Map())
const getFunctionsThatRelyOnMe = me => [ ...functionsToTheFunctionsThatRelyOnThem.get(me) ]


module.exports = function shiz(originalInput) {
	let valueFn = makeFunction(originalInput)
	let dirty = true
	let calculatedValue

	const changeValue = newInput => {
		valueFn = makeFunction(newInput)
	}

	const setDirty = () => {
		if (!dirty) {
			dirty = true
			console.log(`functions that rely on ${emittingFunction.label} directly:`, getFunctionsThatRelyOnMe(emittingFunction).map(({ label }) => label))
			getFunctionsThatRelyOnMe(emittingFunction).forEach(({ setDirty }) => setDirty())
			nextTick(() => emittingFunction.emit('change'))
		}
	}

	const emittingFunction = makeEmitter(newInput => {
		if (newInput === undefined) {
			return wrappedFunction()
		} else {
			changeValue(newInput)
			console.log(`changed value of ${emittingFunction.label} to`, newInput)
			setDirty()
		}
	})

	const wrappedFunction = watchFunction(() => {
		if (dirty) {
			calculatedValue = valueFn()
			console.log(`${emittingFunction.label} recalculated its value, it is now`, calculatedValue)
			dirty = false
		} else {
			console.log(`${emittingFunction.label} returning previously calculated value`, calculatedValue)
		}

		return calculatedValue
	}, emittingFunction)

	emittingFunction.setDirty = setDirty

	emittingFunction()

	return emittingFunction
}



const activeObjects = []

function watchFunction(fn, representativeObject) {
	return (...args) => {
		if (!representativeObject) {
			throw new Error(`Must setRepresentativeObject`)
		}

		if (activeObjects.length > 0) {
			const dependsOnMeDirectly = activeObjects[activeObjects.length - 1]
			console.log(`${dependsOnMeDirectly.label} depends on ${representativeObject.label} directly`)
			functionsToTheFunctionsThatRelyOnThem.get(representativeObject).add(dependsOnMeDirectly)
		}

		activeObjects.push(representativeObject)
		const returnValue = fn(...args)
		activeObjects.pop()

		return returnValue
	}
}
