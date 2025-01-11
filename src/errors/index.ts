/**
 * @public
 */
export class ActionNotExistError extends ReferenceError {

  constructor(actionKey: PropertyKey) {
    super(`Action '${String(actionKey)}' does not exist`)
  }

}

/**
 * @public
 */
export class ValueNotExistError extends ReferenceError {

  constructor(valueKey: PropertyKey) {
    super(`Value '${String(valueKey)}' does not exist`)
  }

}
