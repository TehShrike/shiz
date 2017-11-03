# shiz

values functions and shit

- Whenever a function is run, its dependencies need to be updated
- whenever a value changes
	- all listeners need to be set to dirty
	- after every downstream value has been set to dirty, all downstream values need to emit "need to recalculate"
- whenever a value is destroyed, listeners should get cleaned up, running the function again should throw
