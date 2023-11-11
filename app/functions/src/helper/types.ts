type Result<T, E extends Error> = Success<T> | Failure<E>

class Success<T> {
  readonly isSuccess = true
  readonly isFailure = false
  constructor(readonly value: T) {}
  get(): T{
    return this.value
  }
}

class Failure<E extends Error> {
  readonly isSuccess = false
  readonly isFailure = true
  constructor(readonly value: E) {}
}