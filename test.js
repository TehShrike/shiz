const test = require('tape')
const shiz = require('./')

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
	const a = shiz(1)
	const b = shiz(2)
	const c = shiz(() => 3)
	const d = shiz(() => a() * b())
	const e = shiz(() => d() + c())

	// a.label = 'a'
	// b.label = 'b'
	// c.label = 'c'
	// d.label = 'd'
	// e.label = 'e'

	t.equal(e(), 5)
	a.set(2)
	t.equal(e(), 7)

	t.end()
})

test(`Doesn't calculate values more than once`, t => {
	const a = shiz(3)
	const b = shiz(5)
	const counter = countTimesCalled(() => a() + b())
	const c = shiz(counter)
	const d = shiz(() => c())
	const e = shiz(() => c() + 1)

	a.label = 'a'
	b.label = 'b'
	c.label = 'c'
	d.label = 'd'
	e.label = 'e'

	t.equal(d(), 8)
	t.equal(e(), 9)

	t.equal(counter.get(), 1)

	a.set(4)
	b.set(6)

	t.equal(d(), 10)
	t.equal(e(), 11)

	t.equal(counter.get(), 2)

	t.end()
})

test(`Fires an event once after a bunch of upstream stuff changes`, t => {
	let firstTick = true

	const a = shiz(3)
	const b = shiz(5)

	a.label = 'a'
	b.label = 'b'

	const counter = countTimesCalled(() => a() + b())
	const c = shiz(counter)

	c.label = 'c'

	c.onChange(() => {
		t.notOk(firstTick)

		t.equal(c(), 3)
		t.equal(counter.get(), 2)

		t.end()
	})

	t.equal(counter.get(), 1)

	a.set(1)
	b.set(2)

	firstTick = false
})
