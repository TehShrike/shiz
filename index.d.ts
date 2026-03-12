import type { Emitter } from 'better-emitter'

type Unlisten = () => void

type ObservableEvents = {
	change: undefined
	dirty: undefined
}

type Observable<T> = Emitter<ObservableEvents> & {
	get(): T
	set(value: T): void
	map<U>(fn: (value: T) => U): ComputedObservable<U>
	subscribe(fn: (value: T) => void): Unlisten
}

type ComputedObservable<T> = Omit<Observable<T>, 'set'>

export function value(): Observable<null>
export function value<T>(value: T): Observable<T>
export function computed<
	Deps extends Record<string, Pick<Observable<any>, 'get' | 'on'>>,
	R,
>(
	dependencies: Deps,
	transform: (values: { [K in keyof Deps]: ReturnType<Deps[K]['get']> }) => R,
): ComputedObservable<R>
