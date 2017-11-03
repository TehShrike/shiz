const keyMaster = require('key-master')

const objectsToDependents = keyMaster(() => new Set(), new Map())
const getFunctionsThatRelyOn = me => [ ...objectsToDependents.get(me) ]

const activeObjects = []

function watchFunction(fn, representativeObject) {
	return (...args) => {
		if (!representativeObject) {
			throw new Error(`Must setRepresentativeObject`)
		}

		if (activeObjects.length > 0) {
			const dependsOnThisFunctionDirectly = activeObjects[activeObjects.length - 1]
			// console.log(`${dependsOnThisFunctionDirectly.label} depends on ${representativeObject.label} directly`)
			objectsToDependents.get(representativeObject).add(dependsOnThisFunctionDirectly)
		}

		activeObjects.push(representativeObject)
		const returnValue = fn(...args)
		activeObjects.pop()

		return returnValue
	}
}

module.exports = {
	watchFunction,
	getFunctionsThatRelyOn,
}
