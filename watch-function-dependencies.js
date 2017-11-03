const keyMaster = require('key-master')

const childrenToParents = keyMaster(() => new Set(), new WeakMap())
const parentsToChildren = keyMaster(() => new Set(), new WeakMap())
const toArray = iterator => [ ...iterator ]
const getFunctionsThatRelyOn = o => toArray(childrenToParents.get(o))

const activeChildSets = []

function removeAsParentFromAllChildren(o) {
	const children = parentsToChildren.get(o)

	toArray(children).forEach(child => {
		childrenToParents.get(child).delete(o)
	})
	parentsToChildren.delete(o)
}

function setChildren(parent, children) {
	toArray(children).forEach(child => {
		childrenToParents.get(child).add(parent)
	})
	parentsToChildren.set(parent, children)
}

function watchFunction(fn, representativeObject) {
	if (!representativeObject) {
		throw new Error(`Must setRepresentativeObject`)
	}

	function signalThatFunctionWasRunWithoutRecalculating() {
		if (activeChildSets.length > 0) {
			const parentsChildren = activeChildSets[activeChildSets.length - 1]
			parentsChildren.add(representativeObject)
		}
	}

	function execute(...args) {
		signalThatFunctionWasRunWithoutRecalculating()

		const children = new Set()

		activeChildSets.push(children)
		const returnValue = fn(...args)
		activeChildSets.pop()

		removeAsParentFromAllChildren(representativeObject)
		setChildren(representativeObject, children)

		return returnValue
	}

	execute.signalThatFunctionWasRunWithoutRecalculating = signalThatFunctionWasRunWithoutRecalculating

	return execute
}

module.exports = {
	watchFunction,
	getFunctionsThatRelyOn,
}
