const test = require('tape')
const { value, computed } = require('./')

const countTimesCalled = fn => {
	let count = 0
	const wrapper = (...args) => {
		count++
		return fn(...args)
	}
	wrapper.get = () => count

	return wrapper
}

test(`Some basic case`, t => {
	const a = value(1)
	const b = value(2)
	const c = value(3)
	const d = computed([ a, b ], ([ a, b ]) => a * b)
	const e = computed([ d, c ], ([ d, c ]) => d + c)

	t.equal(e.get(), 5)
	a.set(2)
	t.equal(e.get(), 7)

	t.end()
})

test(`Doesn't calculate values more than once`, t => {
	const a = value(3)
	const b = value(5)
	const cCounter = countTimesCalled(([ a, b ]) => a + b)
	const c = computed([ a, b ], cCounter)
	const d = computed([ c ], ([ c ]) => c)
	const e = computed([ c ], ([ c ]) => c + 1)

	t.equal(d.get(), 8)
	t.equal(e.get(), 9)

	t.equal(cCounter.get(), 1)

	a.set(4)
	b.set(6)

	t.equal(d.get(), 10)
	t.equal(e.get(), 11)

	t.equal(cCounter.get(), 2)

	t.end()
})

test(`Fires an event once after a bunch of upstream stuff changes`, t => {
	let firstTick = true

	const a = value(3)
	const b = value(5)

	const counter = countTimesCalled(([ a, b ]) => a + b)
	const c = computed([ a, b ], counter)

	c.on('change', () => {
		t.notOk(firstTick)

		t.equal(c.get(), 3)
		t.equal(counter.get(), 2)

		t.end()
	})

	t.equal(counter.get(), 1)

	a.set(1)
	b.set(2)

	firstTick = false
})

test(`Values initialize to null`, t => {
	const a = value()

	t.equal(a.get(), null)

	t.end()
})

test(`Shouldn't emit more than one change event when there are multiple updates in a tick`, t => {
	const a = value('yeah')

	t.plan(1)

	a.on('change', () => {
		t.pass(`Callback called`)
	})

	a.set(1)
	a.get()
	a.set(2)
})

test(`map`, t => {
	const initial = value(7)
	const calculated = computed([ initial ], ([ initial ]) => initial + 3)

	const initialMap = initial.map(initial => initial * 2)
	const calculatedMap = calculated.map(calculated => calculated - 5)

	t.equal(initialMap.get(), 14)
	t.equal(calculatedMap.get(), 5)

	t.end()
})
