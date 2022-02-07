/**
 * node-enumerable (https://github.com/mkloubert/node-enumerable)
 *
 * Copyright (c) Marcel Joachim Kloubert <marcel.kloubert@gmx.net>
 */
/**
 * An async action.
 *
 * @template T Type of the underlying items.
 *
 * @param {AsyncActionContext<T>} context The underlying context.
 */
export declare type AsyncAction<T = any> = (context: AsyncActionContext<T>) => void;
/**
 * A context for an async action.
 *
 * @template T Type of the underlying item.
 */
export interface AsyncActionContext<T = any> {
    /**
     * Cancels the whole operation.
     *
     * @param {any} [result] The optional result for the callback.
     */
    cancel(result?: any): void;
    /**
     * The zero based index.
     */
    readonly index: number;
    /**
     * Indicates if this is the first action or not.
     */
    readonly isFirst: boolean;
    /**
     * The zero based index.
     */
    readonly item: T;
    /**
     * The value from the previous operation.
     */
    readonly previousValue: any;
    /**
     * Finishes the action as failed and cancels the whole operation.
     *
     * @param {any} reason The reason why the action has failed.
     * @param {any} [result] Optional result value / object for the callback.
     */
    reject(reason: any, result?: any): void;
    /**
     * Finishes the action as succeeded.
     *
     * @param {any} [nextValue] The value for the 'previousValue' property
     *                          of the next operation.
     */
    resolve(nextValue?: any): void;
    /**
     * Gets or sets the result value for the callback.
     */
    result: any;
    /**
     * Gets the underlying sequence.
     */
    readonly sequence: IEnumerable<T>;
    /**
     * Gets or sets the value for this action and the upcoming ones.
     */
    value: any;
}
/**
 * A factory function that can be cancelled.
 *
 * @template TResult The type of the result.
 *
 * @param {((cancel: (flag?: boolean) => void)} cancel The callback to cancel the operation.
 * @param {number} index The zero based index of that invocation.
 *
 * @return {TResult} The result.
 */
export declare type CancelableFactory<TResult = any> = (cancel: (flag?: boolean) => void, index: number) => TResult;
/**
 * Compares to values.
 *
 * @template T Type of the "left" value.
 * @template U Type of the "right" value.
 *
 * @param {T} x The "left" value.
 * @param {U} y The "right" value.
 *
 * @return {number} The "sort" value.
 */
export declare type Comparer<T = any, U = T> = (x: T, y: U) => number;
/**
 * A forEach action.
 *
 * @template T Type of the items.
 *
 * @param {T} item The current item.
 * @param {number} index The zero based index of the current item.
 */
export declare type EachAction<T = any> = (item: T, index: number) => void;
/**
 * Checks if two values are equal.
 *
 * @template T Type of the "left" value.
 * @template U Type of the "right" value.
 *
 * @param {T} x The "left" value.
 * @param {U} y The "right" value.
 *
 * @return {boolean} Are equal or not.
 */
export declare type EqualityComparer<T = any, U = T> = (x: T, y: U) => boolean;
/**
 * An item message (provider).
 */
export declare type ItemMessage<T = any> = string | ((item: T, index?: number) => any);
/**
 * Saves joined values.
 *
 * @template TOuter Type of the outer value.
 * @template TInner Type of the inner value.
 */
export interface JoinedItems<TOuter = any, TInner = any> {
    /**
     * The inner value.
     */
    inner: TInner;
    /**
     * The outer value.
     */
    outer: TOuter;
}
/**
 * A collection that can be popped.
 */
export interface PoppableStack<T = any> {
    /**
     * The length of the stack.
     */
    length: number;
    /**
     * Pops an element.
     *
     * @return {T} The popped element.
     */
    pop: () => T;
}
/**
 * A predicate / condition.
 *
 * @template T Type of the item to check.
 *
 * @param {T} The item to check.
 *
 * @return {boolean} Item satisfies the condition or not.
 */
export declare type Predicate<T = any> = (item: T) => boolean;
/**
 * A selector.
 *
 * @template T Type of the source item.
 * @template U Type of the new item.
 *
 * @param {T} item The source item.
 *
 * @return {U} The new item.
 */
export declare type Selector<T = any, U = any> = (item: T) => U;
/**
 * Possible sequence types.
 *
 * @template T Type of the items.
 */
export declare type Sequence<T = any> = Iterable<T> | ArrayLike<T> | Iterator<T> | IArguments;
/**
 * A collection that can be shifted.
 */
export interface ShiftableStack<T = any> {
    /**
     * The length of the stack.
     */
    length: number;
    /**
     * Shifts an element.
     *
     * @return {T} The shifted element.
     */
    shift: () => T;
}
/**
 * A stack.
 *
 * @template T The type of the items.
 */
export interface Stack<T = any> {
    /**
     * Pushes one or more item to the stack.
     *
     * @param {...Array<T>} items The items to push.
     *
     * @returns {number} The new length of the stack.
     */
    push(...items: Array<T>): number;
}
/**
 * A sequence.
 *
 * @template T Type of the items.
 */
export interface IEnumerable<T = any> extends Iterable<T>, Iterator<T> {
    /**
     * Handles current items as numbers and returns their absolute values.
     *
     * @param {boolean} [handleAsInt] Handle as integer values (true) or floats (false).
     *                                Default: (false)
     *
     * @return {IEnumerable<number>} The new sequence.
     */
    abs(handleAsInt?: boolean): IEnumerable<number>;
    /**
     * Applies an accumulator function over that sequence.
     * If specified 'seed' is used as the initial accumulator value,
     * and (if specified) the 'resultSelector' is used to select the result value.
     *
     * @template TAccumulate The type of the accumulator value.
     * @template TResult The result type.
     *
     * @param {(acc: TAccumulate, item: T) => TAccumulate} func An accumulator function to be invoked on each element.
     * @param {TAccumulate} [seed] The initial accumulator value.
     * @param {(acc: TAccumulate) => TResult} [resultSelector] A function to transform the final accumulator value
     *                                                         into the result value.
     *
     * @returns {TResult} The final value.
     */
    aggregate<TAccumulate = T, TResult = T>(func: (accumulator: TAccumulate, item: T) => TAccumulate, seed?: TAccumulate, resultSelector?: (accumulator: TAccumulate) => TResult): TResult;
    /**
     * Checks if all elements of that sequence
     * satisfy a condition or not.
     *
     * @param {Predicate<T>} predicate The condition.
     *
     * @returns {boolean} All elements satisfy the condition or not.
     */
    all(predicate: Predicate<T>): boolean;
    /**
     * Checks if at least one element of that sequence
     * satisfies a condition or not.
     *
     * @param {Predicate<T>} predicate The condition.
     *
     * @returns {boolean} One element satisfies the condition or not.
     */
    any(predicate?: Predicate<T>): boolean;
    /**
     * Alias for concat()
     */
    append<U = T>(...args: Sequence<U>[]): IEnumerable<T | U>;
    /**
     * Alias for concatArray()
     */
    appendArray<U = T>(sequences: ArrayLike<Sequence<U>>): IEnumerable<T | U>;
    /**
     * Handles current items as numbers and calculates the arc cosine for each item.
     *
     * @param {boolean} [handleAsInt] Handle as integer values (true) or floats (false).
     *                                Default: (false)
     *
     * @return {IEnumerable<number>} The new sequence.
     */
    arcCos(handleAsInt?: boolean): IEnumerable<number>;
    /**
     * Handles current items as numbers and calculates the arc hyperbolic cosine for each item.
     *
     * @param {boolean} [handleAsInt] Handle as integer values (true) or floats (false).
     *                                Default: (false)
     *
     * @return {IEnumerable<number>} The new sequence.
     */
    arcCosH(handleAsInt?: boolean): IEnumerable<number>;
    /**
     * Handles current items as numbers and calculates the arc sine for each item.
     *
     * @param {boolean} [handleAsInt] Handle as integer values (true) or floats (false).
     *                                Default: (false)
     *
     * @return {IEnumerable<number>} The new sequence.
     */
    arcSin(handleAsInt?: boolean): IEnumerable<number>;
    /**
     * Handles current items as numbers and calculates the arc hyperbolic sine for each item.
     *
     * @param {boolean} [handleAsInt] Handle as integer values (true) or floats (false).
     *                                Default: (false)
     *
     * @return {IEnumerable<number>} The new sequence.
     */
    arcSinH(handleAsInt?: boolean): IEnumerable<number>;
    /**
     * Handles current items as numbers and calculates the arc tangent for each item.
     *
     * @param {boolean} [handleAsInt] Handle as integer values (true) or floats (false).
     *                                Default: (false)
     *
     * @return {IEnumerable<number>} The new sequence.
     */
    arcTan(handleAsInt?: boolean): IEnumerable<number>;
    /**
     * Handles current items as numbers and calculates the arc hyperbolic tangent for each item.
     *
     * @param {boolean} [handleAsInt] Handle as integer values (true) or floats (false).
     *                                Default: (false)
     *
     * @return {IEnumerable<number>} The new sequence.
     */
    arcTanH(handleAsInt?: boolean): IEnumerable<number>;
    /**
     * Asserts that all elements of that sequence meet a given condition,
     * otherwise an error is throw at first fail.
     *
     * @param {Predicate<T>} predicate The predicate / condition.
     * @param {string|((item: T, index: number) => any)} [errMsg] The custom error message to return.
     *
     * @chainable
     *
     * @throws One element failed.
     */
    assert(predicate: Predicate<T>, errMsg?: ItemMessage<T>): this;
    /**
     * Asserts that all elements of that sequence meet a given condition,
     * otherwise an error is throw at the end.
     *
     * @param {Predicate<T>} predicate The predicate / condition.
     * @param {string|((item: T, index: number) => any)} [errMsg] The custom error message to return.
     *
     * @chainable
     *
     * @throws At least one element failed.
     */
    assertAll(predicate: Predicate<T>, errMsg?: ItemMessage<T>): this;
    /**
     * Runs an async action for each item of that sequence.
     *
     * @param AsyncAction<T> action The action to invoke.
     * @param AsyncCallback [callback] The callback.
     * @param {any} [previousValue] The value for the 'previousValue' of the first action.
     *
     * @returns {Promise<any>} The promise.
     */
    async(action: AsyncAction<T>, previousValue?: any): Promise<any>;
    /**
     * Calculates the average of the items of that sequence.
     *
     * @param {Selector<T, number>} [selector] The custom selector to use.
     *
     * @returns {number|symbol} The average or IS_EMPTY if sequence is empty.
     */
    average(selector?: Selector<T, number>): number | symbol;
    /**
     * Gets if that sequence can be resetted or not.
     */
    readonly canReset: boolean;
    /**
     * Returns a "casted" version of that sequence.
     *
     * @template U The target type.
     *
     * @param {string} [type] The optional target type to converts the items to.
     *                        Possible values are: bool/boolean, float/number, func/function, object, string, int/integer,
     *                                             null, undefined,
     *                                             symbol
     *
     * @returns {IEnumerable<U>} The "casted" sequence.
     *
     * @throws Target type is not supported
     */
    cast<U = any>(type?: string): IEnumerable<U>;
    /**
     * Handles current items as float values and returns the smallest value greater than or equal to them.
     *
     * @return {IEnumerable<number>} The new sequence.
     */
    ceil(): IEnumerable<number>;
    /**
     * Splits the given sequence into chunks of the given size.
     *
     * @param {number} [size] The chunk size. Default: 1
     *
     * @return {IEnumerable<IEnumerable<T>>} The sequence of chunks.
     */
    chunk(size?: number): IEnumerable<IEnumerable<T>>;
    /**
     * Clones that sequence multiply times.
     *
     * @template U The type of the target sequences.
     *
     * @param {number} [count] The maximum number of sequences.
     * @param {Selector<T, U>} [itemSelector] The selector for the items.
     *
     * @returns {IEnumerable<IEnumerable<U>>} The sequence of sequences.
     */
    clone<U = T>(count?: number, itemSelector?: Selector<T, U>): IEnumerable<IEnumerable<U>>;
    /**
     * Concats the items of that sequences with other ones
     * to a new sequence.
     *
     * @param {...Sequence<U>[]} args The other sequences.
     *
     * @memberof IEnumerable<T|U> The concated sequence.
     */
    concat<U = T>(...args: Sequence<U>[]): IEnumerable<T | U>;
    /**
     * Concats the items of that sequences with other ones
     * to a new sequence.
     *
     * @param {...Sequence<U>[]} sequences The other sequences.
     *
     * @memberof IEnumerable<T|U> The concated sequence.
     */
    concatArray<U = T>(sequences: ArrayLike<Sequence<U>>): IEnumerable<T | U>;
    /**
     * Completely consumes the given sequence. This method uses immediate execution,
     * and doesn't store any data during execution.
     *
     * @chainable
     */
    consume(): this;
    /**
     * Checks if that sequence contains an item.
     *
     * @template U Type of the item to search for.
     *
     * @param {U} item The item to search for.
     * @param {(EqualityComparer<T, U>|true)} [comparer] The custom equality comparer to use.
     *                                                   (true) indicates to do a === check.
     *
     * @returns {boolean} Sequence contains item or not.
     */
    contains<U>(item: U, comparer?: EqualityComparer<T, U> | true): boolean;
    /**
     * Handles current items as numbers and calculates the cosine for each item.
     *
     * @param {boolean} [handleAsInt] Handle as integer values (true) or floats (false).
     *                                Default: (false)
     *
     * @return {IEnumerable<number>} The new sequence.
     */
    cos(handleAsInt?: boolean): IEnumerable<number>;
    /**
     * Handles current items as numbers and calculates the hyperbolic cosine for each item.
     *
     * @param {boolean} [handleAsInt] Handle as integer values (true) or floats (false).
     *                                Default: (false)
     *
     * @return {IEnumerable<number>} The new sequence.
     */
    cosH(handleAsInt?: boolean): IEnumerable<number>;
    /**
     * Counts the elements of that sequence.
     *
     * @param {Predicate<T>} [predicate] The optional predicate to use.
     *
     * @returns {number} The number of (matching) items.
     */
    count(predicate?: Predicate<T>): number;
    /**
     * Gets the current iterator result.
     */
    readonly current: IteratorResult<T>;
    /**
     * Alias for defaultSequenceIfEmpty()
     */
    defaultArrayIfEmpty(defaultSequence: Sequence<T>): IEnumerable<T>;
    /**
     * Returns the items of that sequence or a default item list
     * if that sequence is empty.
     *
     * @param {...Array<T>} defaultItems The default items.
     *
     * @returns {IEnumerable<T>} The (new) sequence.
     */
    defaultIfEmpty(...defaultItems: Array<T>): IEnumerable<T>;
    /**
     * Returns the items of that sequence or a default item list
     * if that sequence is empty.
     *
     * @param {Sequence<T>} defaultSequence The default items.
     *
     * @returns {IEnumerable<T>} The (new) sequence.
     */
    defaultSequenceIfEmpty(defaultSequence: Sequence<T>): IEnumerable<T>;
    /**
     * Removes duplicate entries from that sequence.
     *
     * @param {EqualityComparer<T>} [comparer] The custom equality comparer to use.
     *                                         (true) indicates to do a === check.
     *
     * @returns {IEnumerable<T>} The new sequence.
     */
    distinct(comparer?: EqualityComparer<T> | true): IEnumerable<T>;
    /**
     * Removes duplicate entries from that sequence by using a selector.
     *
     * @param {Selector<T,U>} selector The selector to use.
     * @param {EqualityComparer<T>} [comparer] The custom equality comparer to use.
     *                                         (true) indicates to do a === check.
     *
     * @returns {IEnumerable<T>} The new sequence.
     */
    distinctBy<U>(selector: Selector<T, U>, comparer?: EqualityComparer<U> | true): IEnumerable<T>;
    /**
     * Alias for forEach()
     */
    each(func: EachAction<T>): this;
    /**
     * Alias for forAll()
     */
    eachAll(func: EachAction<T>): this;
    /**
     * Returns an element at a specific index.
     *
     * @param {number} index The zero based index.
     *
     * @returns {T} The element.
     *
     * @throws Element not found.
     */
    elementAt(index: number): T;
    /**
     * Returns an element at a specific index.
     *
     * @template U Type of the default value.
     *
     * @param {number} index The zero based index
     * @param {U} [defaultValue] The default value. Default: NOT_FOUND
     *
     * @returns {T|U} The element.
     *
     * @throws Element not found.
     */
    elementAtOrDefault<U = symbol>(index: number, defaultValue?: U): T | U;
    /**
     * Returns the items of that sequence except a list of specific ones.
     *
     * @param {Sequence<T>} second The second sequence.
     * @param {EqualityComparer<T>|true} [equalityComparer] The custom equality comparer to use.
     *
     * @return {IEnumerable<T>} The new sequence.
     */
    except(second: Sequence<T>, comparer?: EqualityComparer<T> | true): IEnumerable<T>;
    /**
     * Handles current items as numbers and calculates e (the base of natural logarithms) raised to each value.
     *
     * @param {boolean} [handleAsInt] Handle as integer values (true) or floats (false).
     *                                Default: (false)
     *
     * @return {IEnumerable<number>} The new sequence.
     */
    exp(handleAsInt?: boolean): IEnumerable<number>;
    /**
     * Returns the first element of that sequence.
     *
     * @param {Predicate<T>} [predicate] The optional predicate to use.
     *
     * @returns {T} The first element.
     *
     * @throws Element not found.
     */
    first(predicate?: Predicate<T>): T;
    /**
     * Tries to return the first element.
     *
     * @template U Type of the default value.
     *
     * @param {(Predicate<T>|T)} [predicateOrDefaultValue] The predicate or default value.
     * @param {U} [defaultValue] The default value. Default: NOT_FOUND
     *                                      If definded: predicateOrDefaultValue MUST be a function in this case!
     *
     * @returns {T|U} The item or the default value.
     */
    firstOrDefault<U = symbol>(predicateOrDefaultValue?: Predicate<T> | T, defaultValue?: U): T | U;
    /**
     * Returns a flattened sequence that contains the concatenation of all the nested sequences elements.
     *
     * @return {IEnumerable<U>} The flatten items.
     */
    flatten<U = T>(): IEnumerable<U>;
    /**
     * Handles current items as float values and return the greatest value less than or equal to them.
     *
     * @return {IEnumerable<number>} The new sequence.
     */
    floor(): IEnumerable<number>;
    /**
     * Invokes a function for each element of that sequence and continues
     * even if an error is thrown. All occurred errors will be thrown at the end.
     *
     * @param {EachAction<T>} func The function to invoke.
     *
     * @throws At least on error was thrown while the execution.
     *
     * @chainable
     */
    forAll(func: EachAction<T>): this;
    /**
     * Invokes a function for each element of that sequence.
     *
     * @param {EachAction<T>} func The function to invoke.
     *
     * @chainable
     */
    forEach(func: EachAction<T>): this;
    /**
     * Groups the items of that sequence by a key.
     *
     * @template TKey Type of the keys.
     *
     * @param {Selector<T, TKey>} keySelector The key selector.
     * @param {EqualityComparer<TKey>} [keyEqualityComparer] The custom equality comparer for the keys.
     *
     * @returns {IEnumerable<IGrouping<TKey, T>>} The grouped items.
     */
    groupBy<TKey>(keySelector: Selector<T, TKey>, keyEqualityComparer?: EqualityComparer<TKey>): IEnumerable<IGrouping<TKey, T>>;
    /**
     * Correlates the elements of that sequence and another based on matching keys and groups them.
     *
     * @param {Sequence<TInner>} inner The other sequence.
     * @param {Selector<T, TOuterKey>} [outerKeySelector] The key selector for the items of that sequence.
     * @param {Selector<TInner, TInnerKey} [innerKeySelector] The key selector for the items of the other sequence.
     * @param {((outer: T, inner: IEnumerable<TInner>) => TResult)} [resultSelector] The function that provides the result value for two matching elements.
     * @param {EqualityComparer<TOuterKey, TInnerKey>|true} [keyEqualityComparer] The custom equality comparer for the keys to use.
     *                                                                            (true) indicates to do a === check.
     *
     * @return {IEnumerable<TResult>} The new sequence.
     */
    groupJoin<TInner = T, TOuterKey = any, TInnerKey = any, TResult = JoinedItems<T, IEnumerable<TInner>>>(inner: Sequence<TInner>, outerKeySelector?: Selector<T, TOuterKey>, innerKeySelector?: Selector<TInner, TInnerKey>, resultSelector?: (outer: T, inner: IEnumerable<TInner>) => TResult, keyEqualityComparer?: EqualityComparer<TOuterKey, TInnerKey> | true): IEnumerable<TResult>;
    /**
     * Gets the current zero based index.
     */
    readonly index: number;
    /**
     * Returns the zero based index of the first occurrence of an item.
     *
     * @template U Type of the item to search for.
     *
     * @param {U} item The item to search for.
     * @param {(EqualityComparer<T, U>|true)} [comparer] The custom equality comparer to use.
     *                                                   (true) indicates to do a === check.
     *
     * @returns {number} The index or -1 if not found.
     */
    indexOf<U>(item: U, comparer?: EqualityComparer<T, U> | true): number;
    /**
     * Returns all elements of the collection separated by the given separator(s).
     *
     * @param {U[]} [separators] One or more separator.
     *
     * @return {IEnumerable<T|U>} The new sequence.
     */
    intersperse<U = T>(...separators: U[]): IEnumerable<T | U>;
    /**
     * Returns all elements of the collection separated by the given separator(s).
     *
     * @param {Sequence<U>} separators The separators.
     *
     * @return {IEnumerable<T|U>} The new sequence.
     */
    intersperseArray<U = T>(separators: Sequence<U>): IEnumerable<T | U>;
    /**
     * Returns the intersection between this and a second sequence.
     *
     * @param {Sequence<T>} second The second sequence.
     * @param {EqualityComparer<T>|true} [equalityComparer] The custom equality comparer to use.
     *
     * @return {IEnumerable<T>} The new sequence.
     */
    intersect(second: Sequence<T>, comparer?: EqualityComparer<T> | true): IEnumerable<T>;
    /**
     * Checks if that sequence is empty or not
     * by using the length() method.
     *
     * @return {boolean} Is Empty or not.
     */
    isEmpty(): boolean;
    /**
     * Correlates the elements of that sequence and another based on matching keys.
     *
     * @param {Sequence<TInner>} inner The other sequence.
     * @param {Selector<T, TOuterKey>} [outerKeySelector] The key selector for the items of that sequence.
     * @param {Selector<TInner, TInnerKey} [innerKeySelector] The key selector for the items of the other sequence.
     * @param {((outer: T, inner: IEnumerable<TInner>) => TResult)} [resultSelector] The function that provides the result value for two matching elements.
     * @param {EqualityComparer<TOuterKey, TInnerKey>|true} [keyEqualityComparer] The custom equality comparer for the keys to use.
     *                                                                            (true) indicates to do a === check.
     *
     * @return {IEnumerable<TResult>} The new sequence.
     */
    join<TInner = T, TOuterKey = any, TInnerKey = any, TResult = JoinedItems<T, TInner>>(inner: Sequence<TInner>, outerKeySelector?: Selector<T, TOuterKey>, innerKeySelector?: Selector<TInner, TInnerKey>, resultSelector?: (outer: T, inner: TInner) => TResult, keyEqualityComparer?: EqualityComparer<TOuterKey, TInnerKey> | true): IEnumerable<TResult>;
    /**
     * Joins the items of that sequence to one string.
     *
     * @param {any} [separator] The optional separator to use.
     *
     * @returns {string} The items as string.
     */
    joinToString(separator?: any): string;
    /**
     * Returns the last element of that sequence.
     *
     * @param {Predicate<T>} [predicate] The optional predicate to use.
     *
     * @returns {T} The last element.
     *
     * @throws Element not found.
     */
    last(predicate?: Predicate<T>): T;
    /**
     * Returns the zero based index of the last occurrence of an item.
     *
     * @template U Type of the item to search for.
     *
     * @param {U} item The item to search for.
     * @param {(EqualityComparer<T, U>|true)} [comparer] The custom equality comparer to use.
     *                                                   (true) indicates to do a === check.
     *
     * @returns {number} The index or -1 if not found.
     */
    lastIndexOf<U>(item: U, comparer?: EqualityComparer<T, U> | true): number;
    /**
     * Tries to return the last element.
     *
     * @template U Type of the default value.
     *
     * @param {(Predicate<T>|T)} [predicateOrDefaultValue] The predicate or default value.
     * @param {(T|symbol)} [defaultValue] The default value. Default: NOT_FOUND
     *                                      If definded: predicateOrDefaultValue MUST be a function in this case!
     *
     * @returns {T|U} The item or the default value.
     */
    lastOrDefault<U = symbol>(predicateOrDefaultValue?: Predicate<T> | T, defaultValue?: U): T | U;
    /**
     * Returns the length of the underlying collection.
     * If the underlying object does NOT contain a 'length' property, like a generator, it will
     * behave the same way as 'count' method.
     *
     * @return {number} The length.
     */
    length(): number;
    /**
     * Handles current items as numbers and calculates the logarithm of them.
     *
     * @param {number} [base] The custom base. Default: e
     * @param {boolean} [handleAsInt] Handle as integer values (true) or floats (false).
     *                                Default: (false)
     *
     * @return {IEnumerable<number>} The new sequence.
     */
    log(base?: number, handleAsInt?: boolean): IEnumerable<number>;
    /**
     * Returns a resettable version of that sequence.
     *
     * @returns {IEnumerable<T>} The resettable version of that sequence.
     */
    makeResettable(): IEnumerable<T>;
    /**
     * Returns the maximum item of that sequence.
     *
     * @param {Comparer<U>} [comparer] The custom comparer to use.
     *
     * @returns {T|symbol} The item or IS_EMPTY if that sequence is empty.
     */
    max<U = T>(valueSelector?: Selector<T, U>, comparer?: Comparer<U>): T | symbol;
    /**
     * Returns the minimum item of that sequence.
     *
     * @param {Comparer<U>} [comparer] The custom comparer to use.
     *
     * @returns {T|symbol} The item or IS_EMPTY if that sequence is empty.
     */
    min<U = T>(valueSelector?: Selector<T, U>, comparer?: Comparer<U>): T | symbol;
    /**
     * Removes all values that are no valid numbers.
     *
     * @param {boolean} [checkForInt] Check for integer and not for float. Default: (false)
     *
     * @return {IEnumerable<T>} The filtered sequence.
     */
    noNAN(checkForInt?: boolean): IEnumerable<T>;
    /**
     * Filters the items of that sequence based on a given predicate and returns those items that do not match the predicate.
     *
     * @param {Predicate<T>} [predicate] The optional predicate to use.
     *                                   If no predicate is defined, all values that are empty, (false), (null), (undefined), e.g., are taken.
     *
     * @return {IEnumerable<T>} The filtered sequence.
     */
    not(predicate?: Predicate<T>): IEnumerable<T>;
    /**
     * Removes empty items.
     *
     * @returns {IEnumerable<T>} The filtered sequence.
     */
    notEmpty(): IEnumerable<T>;
    /**
     * Filters items of specific type.
     *
     * @template U The type of the target sequence.
     *
     * @param {string} type The type.
     *
     * @returns {IEnumerable<U>} The filtered sequence.
     */
    ofType<U = any>(type: string): IEnumerable<U>;
    /**
     * Sorts the elements of that sequence in ascending order by using the values itself as keys.
     *
     * @param Comparer<T> [comparer] The custom key comparer to use.
     *
     * @return {IOrderedEnumerable} The new sequence.
     */
    order(comparer?: Comparer<T>): IOrderedEnumerable<T>;
    /**
     * Sorts the elements of that sequence in ascending order.
     *
     * @param {Selector<T,U>} selector The key selector.
     * @param {Comparer<U>} [comparer] The custom key comparer to use.
     *
     * @return {IOrderedEnumerable<T>} The new sequence.
     */
    orderBy<U>(selector: Selector<T, U>, comparer?: Comparer<U>): IOrderedEnumerable<T>;
    /**
     * Sorts the elements of that sequence in descending order.
     *
     * @param {Selector<T,U>} selector The key selector.
     * @param {Comparer<U>} [comparer] The custom key comparer to use.
     *
     * @return {IOrderedEnumerable<T>} The new sequence.
     */
    orderByDescending<U>(selector: Selector<T, U>, comparer?: Comparer<U>): IOrderedEnumerable<T>;
    /**
     * Sorts the elements of that sequence in descending order by using the values as keys.
     *
     * @param {Comparer<T>} [comparer] The custom key comparer to use.
     *
     * @return {IOrderedEnumerable<T>} The new sequence.
     */
    orderDescending(comparer?: Comparer<T>): IOrderedEnumerable<T>;
    /**
     * Executes the given action on each element in the source sequence
     * and yields it.
     *
     * @param {EachAction<T>} action The action to invoke.
     *
     * @return {IEnumerable<T>} The new sequence.
     */
    pipe(action: EachAction<T>): IEnumerable<T>;
    /**
     * Handles current items as base numbers and take them to a specific power.
     *
     * @param {number} [exponent] The exponent. Default: 2
     * @param {boolean} [handleAsInt] Handle as integer values (true) or floats (false).
     *                                Default: (false)
     *
     * @return {IEnumerable<number>} The new sequence.
     */
    pow(exponent?: number, handleAsInt?: boolean): IEnumerable<number>;
    /**
     * Prepends the itms of other sequences to the ones of that sequence.
     *
     * @param {...Sequence<T>[]} args The other sequences.
     *
     * @memberof IEnumerable<T|U> The concated sequence.
     */
    prepend<U = T>(...args: Sequence<T | U>[]): IEnumerable<T | U>;
    /**
     * Prepends the itms of other sequences to the ones of that sequence.
     *
     * @param {...Sequence<T>[]} sequences The other sequences.
     *
     * @memberof IEnumerable<T|U> The concated sequence.
     */
    prependArray<U = T>(sequences: ArrayLike<Sequence<T | U>>): IEnumerable<T | U>;
    /**
     * Calculates the product of that sequence.
     *
     * @returns {(T|symbol)} The product or IS_EMPTY if that sequence is empty.
     */
    product(seed?: T): T | symbol;
    /**
     * Pushes the elements of that sequence to an array or stack-like object.
     *
     * @param {Stack<T>} stack The array or stack.
     *
     * @returns {this}
     */
    pushTo(stack: Stack<T>): this;
    /**
     * Randomizes the order of that sequence.
     *
     * @param {Function} sortValueProvider A custom function that provides a random sort value.
     *
     * @return {IOrderedEnumerable<T>} The new sequence.
     */
    rand(sortValueProvider?: () => any): IOrderedEnumerable<T>;
    /**
     * Returns that sequence.
     *
     * @returns {this}
     *
     * @throws Not supported
     */
    reset(): this;
    /**
     * Reverses the order of that sequence.
     *
     * @return {IOrderedEnumerable<T>} The new sequence.
     */
    reverse(): IOrderedEnumerable<T>;
    /**
     * Handles current items as numbers and calculates the n-th root for each item.
     *
     * @param {number} [power] The power. Default: 2
     * @param {boolean} [handleAsInt] Handle as integer values (true) or floats (false).
     *                                Default: (false)
     *
     * @return {IEnumerable<number>} The new sequence.
     */
    root(power?: number, handleAsInt?: boolean): IEnumerable<number>;
    /**
     * Handles current items as float values and return their nearest values.
     *
     * @return {IEnumerable<number>} The new sequence.
     */
    round(): IEnumerable<number>;
    /**
     * Projects the items of that sequence to new values / objects.
     *
     * @template U The type of the new items.
     *
     * @param {Selector<T, U>} selector
     *
     * @returns {IEnumerable<U>} The new sequence.
     */
    select<U>(selector: Selector<T, U>): IEnumerable<U>;
    /**
     * Projects the items of that sequence to new sequences
     * that are flatten to a single sequence.
     *
     * @template U Type of the items of the result sequences.
     *
     * @param {Selector<T, Sequence<U>>} selector The selector.
     *
     * @returns {IEnumerable<U>} The new, flatten sequence.
     */
    selectMany<U>(selector: Selector<T, Sequence<U>>): IEnumerable<U>;
    /**
     * Checks if that sequence is equal to another.
     *
     * @template U Type of the items of the other sequence.
     *
     * @param {Sequence<U>} other The other sequence.
     * @param {(EqualityComparer<T, U> | true)} [equalityComparer] The custom equality comparer to use.
     *
     * @returns {boolean} Both are equal or not.
     */
    sequenceEqual<U>(other: Sequence<U>, equalityComparer?: EqualityComparer<T, U> | true): boolean;
    /**
     * Alias for rand()
     */
    shuffle(sortValueProvider?: () => any): IOrderedEnumerable<T>;
    /**
     * Handles current items as numbers and calculates the sine for each item.
     *
     * @param {boolean} [handleAsInt] Handle as integer values (true) or floats (false).
     *                                Default: (false)
     *
     * @return {IEnumerable<number>} The new sequence.
     */
    sin(handleAsInt?: boolean): IEnumerable<number>;
    /**
     * Returns the one and only element of that sequence.
     *
     * @param {Predicate<T>} [predicate] The optional predicate to use.
     *
     * @returns {T} The single element.
     *
     * @throws Element not found or sequence contains for than one (matching) element.
     */
    single(predicate?: Predicate<T>): T;
    /**
     * Tries to return the one and only element.
     *
     * @template U Type of the default value.
     *
     * @param {(Predicate<T>|T)} [predicateOrDefaultValue] The predicate or default value.
     * @param {(T|symbol)} [defaultValue] The default value. Default: NOT_FOUND
     *                                      If definded: predicateOrDefaultValue MUST be a function in this case!
     *
     * @returns {T|U} The item or the default value.
     *
     * @throws Sequence contains for than one (matching) element.
     */
    singleOrDefault<U = symbol>(predicateOrDefaultValue?: Predicate<T> | T, defaultValue?: U): T | U;
    /**
     * Handles current items as numbers and calculates the hyperbolic sine for each item.
     *
     * @param {boolean} [handleAsInt] Handle as integer values (true) or floats (false).
     *                                Default: (false)
     *
     * @return {IEnumerable<number>} The new sequence.
     */
    sinH(handleAsInt?: boolean): IEnumerable<number>;
    /**
     * Skips a maximum number of items.
     *
     * @param {number} [count] The number of items to skip. Default: 1
     *
     * @return {IEnumerable<T>} The new sequence.
     */
    skip(count?: number): IEnumerable<T>;
    /**
     * Takes all elements but the last one.
     *
     * @return {IEnumerable<T>} The new sequence.
     */
    skipLast(): IEnumerable<T>;
    /**
     * Skips items while a condition satisfies.
     *
     * @param {Predicate<T>} [predicate] The predicate to use.
     *
     * @return {IEnumerable<T>} The new sequence.
     */
    skipWhile(predicate: Predicate<T>): IEnumerable<T>;
    /**
     * Handles current items as numbers and calculates square root for each item.
     *
     * @param {boolean} [handleAsInt] Handle as integer values (true) or floats (false).
     *                                Default: (false)
     *
     * @return {IEnumerable<number>} The new sequence.
     */
    sqrt(handleAsInt?: boolean): IEnumerable<number>;
    /**
     * Calculates the sum of that sequence.
     *
     * @returns {(T|symbol)} The sum or IS_EMPTY if that sequence is empty.
     */
    sum(seed?: T): T | symbol;
    /**
     * Takes a maximum number of items.
     *
     * @param {number} [count] The maximum number of items. Default: 1
     *
     * @return {IEnumerable<T>} The new sequence.
     */
    take(count?: number): IEnumerable<T>;
    /**
     * Takes items while a condition satisfies.
     *
     * @param {Predicate<T>} [predicate] The predicate to use.
     *
     * @return {IEnumerable<T>} The new sequence.
     */
    takeWhile(predicate: Predicate<T>): IEnumerable<T>;
    /**
     * Handles current items as numbers and calculates the tangent for each item.
     *
     * @param {boolean} [handleAsInt] Handle as integer values (true) or floats (false).
     *                                Default: (false)
     *
     * @return {IEnumerable<number>} The new sequence.
     */
    tan(handleAsInt?: boolean): IEnumerable<number>;
    /**
     * Handles current items as numbers and calculates the hyperbolic tangent for each item.
     *
     * @param {boolean} [handleAsInt] Handle as integer values (true) or floats (false).
     *                                Default: (false)
     *
     * @return {IEnumerable<number>} The new sequence.
     */
    tanH(handleAsInt?: boolean): IEnumerable<number>;
    /**
     * Creates a new array from the items of that sequence.
     *
     * @returns {Array<T>} The sequence as array.
     */
    toArray(): Array<T>;
    /**
     * Converts that sequence to a lookup object.
     *
     * @template TKey Type of the keys.
     * @template U Type of the result object.
     *
     * @param {Selector<T, TKey>} keySelector The key selector.
     * @param {EqualityComparer<TKey>} [keyEqualityComparer] The custom equality comparer for the keys.
     *
     * @returns U The lookup object
     */
    toLookup<TKey extends PropertyKey, U = any>(keySelector: Selector<T, TKey>, keyEqualityComparer?: EqualityComparer<TKey>): U;
    /**
     * Wraps the items of that sequence to an object.
     *
     * @template TResult Type of the result.
     * @template TKey Type of the keys.
     *
     * @param {(item: T, index: number) => TKey} [keySelector] The selector for the keys.
     *
     * @returns TResult The new object.
     */
    toObject<TResult = any, TKey extends PropertyKey = number>(keySelector?: (item: T, index: number) => TKey): TResult;
    /**
     * Traces the elements of that sequence.
     *
     * @param {Selector<T, any>} [formatter] The custom formatter to use.
     *
     * @return {IEnumerable<T>} The new, piped sequence.
     */
    trace(formatter?: Selector<T, any>): IEnumerable<T>;
    /**
     * Produces the union of that sequence and another.
     *
     * @param {Sequence<T>} second The other sequence.
     * @param {EqualityComparer<T>|true} [comparer] The optional equality comparer to use.
     *
     * @returns {IEnumerable<T>} The new sequence.
     */
    union(second: Sequence<T>, comparer?: EqualityComparer<T> | true): IEnumerable<T>;
    /**
     * Filters the items of that sequence.
     *
     * @param {Predicate<T>} predicate The predicate to use.
     *
     * @return {IEnumerable<T>} The filtered sequence.
     */
    where(predicate: Predicate<T>): IEnumerable<T>;
    /**
     * Applies a specified function to the corresponding elements of that sequence
     * and another, producing a sequence of the results.
     *
     * @template U Type of the other sequence.
     * @template TResult The result type.
     *
     * @param {Sequence<U>} second The other sequence.
     * @param {ZipSelector<T,U,TResult>} resultSelector The selector for the result item.
     *
     * @returns {IEnumerable<TResult>} The "zipped" sequence.
     */
    zip<U = T, TResult = any>(second: Sequence<U>, resultSelector: ZipSelector<T, U, TResult>): IEnumerable<TResult>;
}
/**
 * Describes a grouping.
 *
 * @template T Type of the items.
 * @template TKey Type of the key.
 */
export interface IGrouping<TKey = any, T = any> extends IEnumerable<T> {
    /**
     * Gets the key.
     */
    readonly key: TKey;
}
/**
 * Describes an ordered sequence.
 */
export interface IOrderedEnumerable<T = any> extends IEnumerable<T> {
    /**
     * Performs a subsequent ordering of the elements in that sequence in ascending order,
     * using the values itself as keys.
     *
     * @param {Comparer<T>} [comparer] The custom key comparer to use.
     *
     * @return {IOrderedEnumerable<T>} The new sequence.
     */
    then(comparer?: Comparer<T>): IOrderedEnumerable<T>;
    /**
     * Performs a subsequent ordering of the elements in that sequence in ascending order, according to a key.
     *
     * @template U Type of the keys.
     *
     * @param any selector The key selector.
     * @param {Comparer<U>} [comparer] The custom key comparer to use.
     *
     * @return {IOrderedEnumerable<T>} The new sequence.
     */
    thenBy<U>(selector: Selector<T, U>, comparer?: Comparer<U>): IOrderedEnumerable<T>;
    /**
     * Performs a subsequent ordering of the elements in that sequence in descending order, according to a key.
     *
     * @template U Type of the keys.
     *
     * @param any selector The key selector.
     * @param {Comparer<U>} [comparer] The custom key comparer to use.
     *
     * @return {IOrderedEnumerable<T>} The new sequence.
     */
    thenByDescending<U>(selector: Selector<T, U>, comparer?: Comparer<U>): IOrderedEnumerable<T>;
    /**
     * Performs a subsequent ordering of the elements in that sequence in descending order,
     * using the values as keys.
     *
     * @param {Comparer<T>} [comparer] The custom key comparer to use.
     *
     * @return {IOrderedEnumerable<T>} The new sequence.
     */
    thenDescending(comparer?: Comparer<T>): IOrderedEnumerable<T>;
}
/**
 * A result selector for a 'zip' method / function.
 *
 * @param {T} x The "left" value.
 * @param {U} y The "other" value.
 * @param {number} index The zero based index.
 *
 * @return {TResult} The "zipped" result,
 */
export declare type ZipSelector<T = any, U = T, TResult = any> = (x: T, y: U, index: number) => TResult;
