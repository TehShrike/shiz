import { test } from 'node:test'
import assert from 'node:assert/strict'
import { value, computed } from './index.js'

const countTimesCalled = fn => {
	let count = 0
	const wrapper = (...args) => {
		count++
		return fn(...args)
	}
	wrapper.get = () => count

	return wrapper
}

test(`Some basic case`, () => {
	const a = value(1)
	const b = value(2)
	const c = value(3)
	const d = computed({ a, b }, ({ a, b }) => a * b)
	const e = computed({ d, c }, ({ d, c }) => d + c)

	assert.equal(e.get(), 5)
	a.set(2)
	assert.equal(e.get(), 7)
})

test(`Doesn't calculate values more than once`, () => {
	const a = value(3)
	const b = value(5)
	const cCounter = countTimesCalled(({ a, b }) => a + b)
	const c = computed({ a, b }, cCounter)
	const d = computed({ c }, ({ c }) => c)
	const e = computed({ c }, ({ c }) => c + 1)

	assert.equal(d.get(), 8)
	assert.equal(e.get(), 9)

	assert.equal(cCounter.get(), 1)

	a.set(4)
	b.set(6)

	assert.equal(d.get(), 10)
	assert.equal(e.get(), 11)

	assert.equal(cCounter.get(), 2)
})

test(`Fires an event once after a bunch of upstream stuff changes`, (t, done) => {
	let firstTick = true

	const a = value(3)
	const b = value(5)

	const counter = countTimesCalled(({ a, b }) => a + b)
	const c = computed({ a, b }, counter)

	c.on(`change`, () => {
		assert.equal(firstTick, false)

		assert.equal(c.get(), 3)
		assert.equal(counter.get(), 2)

		done()
	})

	assert.equal(counter.get(), 1)

	a.set(1)
	b.set(2)

	firstTick = false
})

test(`Values initialize to null`, () => {
	const a = value()

	assert.equal(a.get(), null)
})

test(`Shouldn't emit more than one change event when there are multiple updates in a tick`, (t, done) => {
	const a = value(`yeah`)

	let callCount = 0

	a.on(`change`, () => {
		callCount++
		assert.equal(callCount, 1, `Callback should only be called once`)
		done()
	})

	a.set(1)
	a.get()
	a.set(2)
})

test(`map`, () => {
	const initial = value(7)
	const calculated = computed({ initial }, ({ initial }) => initial + 3)

	const initialMap = initial.map(initial => initial * 2)
	const calculatedMap = calculated.map(calculated => calculated - 5)

	assert.equal(initialMap.get(), 14)
	assert.equal(calculatedMap.get(), 5)
})

test(`Emits change events every new tick when a value changes`, (t, done) => {
	const observableValue = value(7)

	observableValue.once(`change`, () => {
		assert.equal(observableValue.get(), 8)

		observableValue.once(`change`, () => {
			assert.equal(observableValue.get(), 9)

			done()
		})

		observableValue.set(9)
	})

	observableValue.set(8)
})

test(`Emits change events every new tick when a computed changes`, (t, done) => {
	const initial = value(7)
	const observableComputed = computed({ n: initial }, ({ n }) => n * 2)

	observableComputed.once(`change`, () => {
		assert.equal(observableComputed.get(), 16)

		observableComputed.once(`change`, () => {
			assert.equal(observableComputed.get(), 18)

			done()
		})

		initial.set(9)
	})

	initial.set(8)
})

test(`subscribe method fires right away`, (t, done) => {
	const someValue = value(2)

	const unsubscribe = someValue.subscribe(number => {
		assert.equal(number, 2)

		unsubscribe()
		done()
	})
})

test(`subscribe method fires when a value is changed`, (t, done) => {
	const someValue = value(2)

	let calls = 0

	const unsubscribe = someValue.subscribe(number => {
		calls++

		if (calls === 1) {
			assert.equal(number, 2)
		} else {
			assert.equal(calls, 2)
			assert.equal(number, 3)

			unsubscribe()
			done()
		}
	})

	someValue.set(3)
})

test(`subscribe returns a working unsubscribe function`, (t, done) => {
	const someValue = value(2)

	let calls = 0

	const unsubscribe = someValue.subscribe(number => {
		calls++

		if (calls === 1) {
			assert.equal(number, 2)
		} else {
			assert.fail(`There shouldn't be more than one call`)
		}
	})

	unsubscribe()

	someValue.set(3)

	// Give time for any erroneous callbacks to fire
	queueMicrotask(() => done())
})
