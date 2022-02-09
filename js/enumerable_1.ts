import {
  AsyncAction,
  CancelableFactory,
  Comparer,
  EachAction,
  EqualityComparer,
  IEnumerable,
  IGrouping,
  IOrderedEnumerable,
  ItemMessage,
  JoinedItems,
  PoppableStack,
  Predicate,
  Selector,
  Sequence,
  ShiftableStack,
  Stack,
  ZipSelector,
} from "./enumerable_define";

const Enumerable: Record<string, any> = {
  /**
   * Indicates that something is empty.
   */
  IS_EMPTY: Symbol("IS_EMPTY"),
  /**
   * Indicates that something is an enumerable (sequence).
   */
  IS_ENUMERABLE: Symbol("IS_ENUMERABLE"),
  /**
   * Indicates if something was not found.
   */
  NOT_FOUND: Symbol("NOT_FOUND"),
};

/**
 * Represents a list of errors.
 */
class AggregateError extends Error {
  /**
   * Stores the errors.
   */
  protected _errors: any[];

  /**
   * Initializes a new instance of that class.
   *
   * @param {any[]} [errors] The occurred errors.
   */
  constructor(errors?: any[]) {
    super();
    this._errors = (errors || []).filter((e) => {
      return !isNullOrUndefined(e);
    });
  }

  /**
   * Gets the errors.
   */
  public get errors() {
    return this._errors;
  }

  /** @inheritdoc */
  public get stack() {
    return this.errors
      .map((e, i) => {
        const TITLE = "STACK #" + (i + 1);
        const LINE = repeat("=", TITLE.length + 5).joinToString();
        return `${TITLE}\n${LINE}\n${toStringSafe(e["stack"])}`;
      })
      .join("\n\n");
  }

  /** @inheritdoc */
  public toString() {
    return this.errors
      .map((e, i) => {
        const TITLE = "ERROR #" + (i + 1);
        const LINE = repeat("=", TITLE.length + 5).joinToString();
        return `${TITLE}\n${LINE}\n${e}`;
      })
      .join("\n\n");
  }
}
Enumerable.AggregateError = AggregateError;

/**
 * A error wrapper for a function.
 */
class FunctionError extends Error {
  /**
   * Stores the inner error.
   */
  protected _error: any;
  /**
   * Stores the underlying function.
   */
  protected _function: Function;
  /**
   * Stores the (zero based) index.
   */
  protected _index: number;

  /**
   * Initializes a new instance of that class.
   *
   * @param {any} [err] The underlying, inner error.
   * @param {Function} [func] The underlying function.
   * @param {number} [index] The (zero based) index.
   */
  constructor(err?: any, func?: Function, index?: number) {
    super();
    this._error = err;
    this._function = func;
    this._index = index;
  }

  /**
   * Gets the (zero based) index.
   */
  public get index() {
    return this._index;
  }

  /**
   * Gets the inner error.
   */
  public get innerError() {
    return this._error;
  }

  /** @inheritdoc */
  public get stack() {
    if (this.innerError) {
      return this.innerError["stack"];
    }
  }

  /** @inheritdoc */
  public toString() {
    let title = "ACTION ERROR";
    if (!isNaN(this.index)) {
      title += " #" + this.index;
    }
    const LINE = repeat("=", title.length + 5).joinToString();
    let content = "";
    if (this.innerError) {
      content += this.innerError;
    }
    return `${title}\n${LINE}\n${content}`;
  }
}
Enumerable.FunctionError = FunctionError;

/**
 * A basic sequence.
 */
abstract class EnumerableBase<T> implements IEnumerable<T> {
  /**
   * Stores the current iterator result.
   */
  protected _current: IteratorResult<T>;
  /**
   * Stores the current index.
   */
  protected _index: number;

  /**
   * Indicates that that instance is an enumerable (sequence).
   */
  readonly IS_ENUMERABLE: symbol;

  constructor() {
    /**
     * Stores the current index.
     */
    this._index = -1;
    /**
     * Indicates that that instance is an enumerable (sequence).
     */
    this.IS_ENUMERABLE = Enumerable.IS_ENUMERABLE;
  }

  /** @inheritdoc */
  [Symbol.iterator]() {
    return this;
  }

  abstract next(...args: []): IteratorResult<T>;

  /** @inheritdoc */
  public abs(handleAsInt?: boolean): IEnumerable<number> {
    return this.select((x) => {
      return invokeForValidNumber(x, (y) => Math.abs(y), handleAsInt);
    });
  }

  /** @inheritdoc */
  public aggregate<TAccumulate = T, TResult = T>(
    func: (accumulator: TAccumulate, item: T) => TAccumulate,
    seed?: TAccumulate,
    resultSelector?: (accumulator: TAccumulate) => TResult,
  ): TResult {
    // if (!func) {
    //   func = (acc, item) => acc + item;
    // }
    const _func = !func ? (acc: any, item: any) => acc + item : func;
    if (!resultSelector) {
      resultSelector = (acc) => acc as unknown as TResult;
    }
    let acc = seed;
    for (let item of this) {
      acc = _func(acc, item);
    }
    return resultSelector(acc);
  }

  /** @inheritdoc */
  public all(predicate: Predicate<T>): boolean {
    const _predicate = toPredicateSafe(predicate);
    for (let item of this) {
      if (!_predicate(item)) {
        return false;
      }
    }
    return true;
  }

  /** @inheritdoc */
  public any(predicate: Predicate<T>): boolean {
    const _predicate = toPredicateSafe(predicate);
    for (let item of this) {
      if (_predicate(item)) {
        return true;
      }
    }
    return false;
  }

  /** @inheritdoc */
  public append<U = T>(...args: Sequence<U>[]): IEnumerable<T | U> {
    return this.concat.apply(this, arguments);
  }

  /** @inheritdoc */
  public appendArray<U = T>(
    sequences: ArrayLike<Sequence<U>>,
  ): IEnumerable<T | U> {
    return this.concatArray.apply(this, arguments);
  }

  /** @inheritdoc */
  public arcCos(handleAsInt?: boolean): IEnumerable<number> {
    return this.select((x) =>
      invokeForValidNumber(x, (y: number) => Math.acos(y), handleAsInt),
    );
  }

  /** @inheritdoc */
  public arcCosH(handleAsInt?: boolean): IEnumerable<number> {
    return this.select((x) =>
      invokeForValidNumber(x, (y: number) => Math.acosh(y), handleAsInt),
    );
  }

  /** @inheritdoc */
  public arcSin(handleAsInt?: boolean): IEnumerable<number> {
    return this.select((x) =>
      invokeForValidNumber(x, (y: number) => Math.asin(y), handleAsInt),
    );
  }

  /** @inheritdoc */
  public arcSinH(handleAsInt?: boolean): IEnumerable<number> {
    return this.select((x) =>
      invokeForValidNumber(x, (y: number) => Math.asinh(y), handleAsInt),
    );
  }

  /** @inheritdoc */
  public arcTan(handleAsInt?: boolean): IEnumerable<number> {
    return this.select((x) =>
      invokeForValidNumber(x, (y: number) => Math.atan(y), handleAsInt),
    );
  }

  /** @inheritdoc */
  public arcTanH(handleAsInt?: boolean): IEnumerable<number> {
    return this.select((x) =>
      invokeForValidNumber(x, (y: number) => Math.atanh(y), handleAsInt),
    );
  }

  /** @inheritdoc */
  public assert(predicate: Predicate<T>, errMsg?: ItemMessage<T>): this {
    const _predicate = toPredicateSafe(predicate);
    errMsg = toItemMessageSafe(errMsg);
    let i = -1;
    for (let item of this) {
      ++i;
      if (!_predicate(item)) {
        throw errMsg(item, i);
      }
    }
    return this;
  }

  /** @inheritdoc */
  public assertAll(predicate: Predicate<T>, errMsg?: ItemMessage<T>): this {
    predicate = toPredicateSafe(predicate);
    errMsg = toItemMessageSafe(errMsg);
    const ERRORS = [];
    let i = -1;
    for (let item of this) {
      ++i;
      if (!predicate(item)) {
        ERRORS.push(errMsg(item, i));
      }
    }
    if (ERRORS.length > 0) {
      throw new AggregateError(ERRORS);
    }
    return this;
  }

  /** @inheritdoc */
  public async(action: AsyncAction<T>, previousValue?: any): Promise<any> {
    const ME = this;
    return new Promise((resolve, reject) => {
      let asyncResult: any;
      const ASYNC_COMPLETED = (err: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(asyncResult);
        }
      };
      try {
        let i = -1;
        let prevVal = previousValue;
        let val: any;
        const NEXT_ITEM = () => {
          ++i;
          const ITEM = this.next();
          if (!ITEM || ITEM.done) {
            ASYNC_COMPLETED(null);
            return;
          }
          const CTX: any = {
            cancel: function (result: any) {
              if (arguments.length > 0) {
                asyncResult = result;
              }
              ASYNC_COMPLETED(null);
            },
            index: i,
            isFirst: 0 === i,
            item: ITEM.value,
            previousValue: prevVal,
            reject: function (reason: any, result?: any) {
              if (arguments.length > 1) {
                asyncResult = result;
              }
              ASYNC_COMPLETED(reason);
            },
            resolve: function (nextValue?: any) {
              prevVal = nextValue;
              NEXT_ITEM();
            },
            result: undefined,
            sequence: ME,
            value: undefined,
          };
          // ctx.result
          Object.defineProperty(CTX, "result", {
            get: () => {
              return asyncResult;
            },
            set: (newValue) => {
              asyncResult = newValue;
            },
            enumerable: true,
          });
          // ctx.value
          Object.defineProperty(CTX, "value", {
            get: () => {
              return val;
            },
            set: (newValue) => {
              val = newValue;
            },
            enumerable: true,
          });
          try {
            if (action) {
              action(CTX);
            } else {
              CTX.resolve();
            }
          } catch (e) {
            CTX.reject(e);
          }
        };
        NEXT_ITEM();
      } catch (e) {
        ASYNC_COMPLETED(e);
      }
    });
  }

  /** @inheritdoc */
  public average(selector?: Selector<T, number>): number | symbol {
    if (!selector) {
      selector = (i) => i as unknown as number;
    }
    let count = 0;
    let sum = 0.0;
    for (let n of this.select(selector)) {
      if (!isNullOrUndefined(n)) {
        if ("number" !== typeof n) {
          n = parseFloat(toStringSafe(n).trim());
        }
      }
      ++count;
      sum += n;
    }
    return count > 0 ? sum / count : Enumerable.IS_EMPTY;
  }

  /** @inheritdoc */
  public get canReset() {
    return false;
  }

  /** @inheritdoc */
  public cast<U>(type?: string): IEnumerable<U> {
    type = toStringSafe(type).trim();
    return this.select((x: any) => {
      if ("" !== type) {
        switch (type) {
          case "bool":
          case "boolean":
            x = !!x;
            break;
          case "float":
            x = parseFloat(toStringSafe(x).trim());
            break;
          case "func":
          case "function":
            if ("function" !== typeof x) {
              const FUNC_RESULT = x;
              x = function () {
                return FUNC_RESULT;
              };
            }
            break;
          case "null":
            x = null;
            break;
          case "number":
            if ("number" !== typeof x) {
              x = parseFloat(toStringSafe(x).trim());
            }
            break;
          case "object":
            if (!isNullOrUndefined(x)) {
              if ("object" !== typeof x) {
                x = JSON.parse(toStringSafe(x));
              }
            }
            break;
          case "int":
          case "integer":
            x = parseInt(toStringSafe(x).trim());
            break;
          case "string":
            x = "" + x;
            break;
          case "symbol":
            if ("symbol" !== typeof x) {
              let desc = x;
              if (!isNullOrUndefined(desc)) {
                if ("number" !== typeof desc) {
                  desc = toStringSafe(desc);
                }
              }
              x = Symbol(desc);
            }
            break;
          case "undefined":
            x = undefined;
            break;
          default:
            throw "Not supported type " + type;
        }
      }
      return x;
    });
  }

  /** @inheritdoc */
  public ceil(): IEnumerable<number> {
    return this.select((x) => {
      return invokeForValidNumber(x, (y: number) => Math.ceil(y));
    });
  }

  /** @inheritdoc */
  public chunk(size?: number): IEnumerable<IEnumerable<T>> {
    size = parseInt(toStringSafe(size).trim());
    if (isNaN(size)) {
      size = 1;
    }
    return from(this._chunkInner(size));
  }

  /**
   * @see chunk()
   */
  private *_chunkInner(size: any) {
    let currentChunk;
    while (true) {
      const ARR = this.getNextChunkArray(size);
      if (ARR.length > 0) {
        yield from(ARR);
      } else {
        break;
      }
    }
  }

  /** @inheritdoc */
  public clone<U = T>(
    count?: number,
    itemSelector?: Selector<T, U>,
  ): IEnumerable<IEnumerable<U>> {
    count = parseInt(toStringSafe(count).trim());
    return from(this._cloneInner(count, itemSelector));
  }

  /**
   * @see concatArray()
   */
  private *_cloneInner<U>(
    count: number,
    itemSelector: Selector<T, U>,
  ): Generator<any, void, unknown> {
    const ITEMS = this.toArray();
    while (true) {
      if (!isNaN(count)) {
        if (count-- < 1) {
          break;
        }
      }
      let seq = from(ITEMS);
      if (itemSelector) {
        seq = seq.select(itemSelector) as unknown as IEnumerable<T>;
      }
      yield seq;
    }
  }

  /** @inheritdoc */
  public concat<U = T>(...args: Sequence<U>[]): IEnumerable<T | U> {
    return this.concatArray(args);
  }

  /** @inheritdoc */
  public concatArray<U = T>(
    sequences: ArrayLike<Sequence<U>>,
  ): IEnumerable<T | U> {
    return from(this._concatArrayInner(sequences));
  }

  /**
   * @see concatArray()
   */
  private *_concatArrayInner<U>(
    sequences: ArrayLike<Sequence<U>>,
  ): IterableIterator<T | U> {
    for (let item of this) {
      yield item as unknown as T;
    }
    if (sequences) {
      for (let i = 0; i < sequences.length; i++) {
        const SEQ = sequences[i];
        for (let item of from(SEQ)) {
          yield item;
        }
      }
    }
  }

  /** @inheritdoc */
  public consume() {
    for (let item of this) {
    }
    return this;
  }

  /** @inheritdoc */
  public contains<U>(
    item: U,
    comparer?: EqualityComparer<T, U> | true,
  ): boolean {
    return this.indexOf(item, comparer) > -1;
  }

  /** @inheritdoc */
  public cos(handleAsInt?: boolean): IEnumerable<number> {
    return this.select((x) =>
      invokeForValidNumber(x, (y: number) => Math.cos(y), handleAsInt),
    );
  }

  /** @inheritdoc */
  public cosH(handleAsInt?: boolean): IEnumerable<number> {
    return this.select((x) =>
      invokeForValidNumber(x, (y: number) => Math.cosh(y), handleAsInt),
    );
  }

  /** @inheritdoc */
  public count(predicate?: Predicate<T>): number {
    predicate = toPredicateSafe(predicate);
    let cnt = 0;
    for (let item of this) {
      if (predicate(item)) {
        ++cnt;
      }
    }
    return cnt;
  }

  /** @inheritdoc */
  public get current() {
    return this._current;
  }

  /** @inheritdoc */
  public defaultArrayIfEmpty(defaultSequence: Sequence<T>): IEnumerable<T> {
    return this.defaultSequenceIfEmpty.apply(this, arguments);
  }

  /** @inheritdoc */
  public defaultIfEmpty(...defaultItems: Array<T>): IEnumerable<T> {
    return from(this._defaultIfEmptyInner(defaultItems));
  }

  /**
   * @see defaultIfEmpty()
   */
  private *_defaultIfEmptyInner(
    defaultItems: Array<T>,
  ): Generator<T, void, unknown> {
    let hasItems = false;
    for (let item of this) {
      hasItems = true;
      yield item as unknown as T;
    }
    if (!hasItems && defaultItems) {
      for (let item of defaultItems) {
        yield item;
      }
    }
  }

  /** @inheritdoc */
  public defaultSequenceIfEmpty(defaultSequence: Sequence<T>): IEnumerable<T> {
    return from(this._defaultSequenceIfEmptyInner(defaultSequence));
  }

  /**
   * @see defaultIfEmpty()
   */
  private *_defaultSequenceIfEmptyInner(
    defaultSequence: Sequence<T>,
  ): Generator<T, void, unknown> {
    let hasItems = false;
    for (let item of this) {
      hasItems = true;
      yield item as unknown as T;
    }
    if (!hasItems) {
      for (let item of from(defaultSequence)) {
        yield item;
      }
    }
  }

  /** @inheritdoc */
  public distinct(comparer?: EqualityComparer<T> | true): IEnumerable<T> {
    return this.distinctBy((x) => x, comparer);
  }

  /** @inheritdoc */
  public distinctBy<U>(
    selector: Selector<T, U>,
    comparer?: EqualityComparer<U> | true,
  ): IEnumerable<T> {
    if (!selector) {
      selector = (i) => i as unknown as U;
    }
    comparer = toEqualityComparerSafe(comparer);
    return from(this._distinctByInner(selector, comparer));
  }

  /**
   * @see distinct()
   */
  private *_distinctByInner<U>(
    selector: Selector<T, U>,
    comparer: EqualityComparer<U>,
  ): Generator<T, void, unknown> {
    const TEMP = [];
    for (let item of this) {
      const KEY_ITEM = selector(item);
      let found = false;
      for (let t of TEMP) {
        if (comparer(KEY_ITEM, t)) {
          found = true;
          break;
        }
      }
      if (!found) {
        TEMP.push(KEY_ITEM);
        yield item;
      }
    }
  }

  /** @inheritdoc */
  public each(action: EachAction<T>): this {
    return this.forEach.apply(this, arguments);
  }

  /** @inheritdoc */
  public eachAll(action: EachAction<T>): this {
    return this.forAll.apply(this, arguments);
  }

  /** @inheritdoc */
  public elementAt(index: number): T {
    const ELEMENT_NOT_FOUND = Symbol("ELEMENT_NOT_FOUND");
    const ITEM = this.elementAtOrDefault(index, ELEMENT_NOT_FOUND);
    if (ELEMENT_NOT_FOUND === ITEM) {
      throw "Element not found";
    }
    return ITEM;
  }

  /** @inheritdoc */
  public elementAtOrDefault<U = Symbol>(
    index: number,
    defaultValue?: U,
  ): T | U {
    index = parseInt(toStringSafe(index).trim());
    if (arguments.length < 2) {
      defaultValue = Enumerable.NOT_FOUND as unknown as U;
    }
    let i = -1;
    for (let item of this) {
      if (++i === index) {
        return item;
      }
    }
    return defaultValue;
  }

  /** @inheritdoc */
  public except(
    second: Sequence<T>,
    comparer?: EqualityComparer<T> | true,
  ): IEnumerable<T> {
    return from(
      this._exceptInner(
        from(second).distinct().toArray(),
        toEqualityComparerSafe(comparer),
      ),
    );
  }

  /**
   * @see except()
   */
  private *_exceptInner(
    second: Array<T>,
    comparer: EqualityComparer<T>,
  ): Generator<T, void, unknown> {
    for (let item of this) {
      let found = false;
      for (let secondItem of second) {
        if (comparer(item, secondItem)) {
          found = true;
          break;
        }
      }
      if (!found) {
        yield item;
      }
    }
  }

  /** @inheritdoc */
  public exp(handleAsInt?: boolean): IEnumerable<number> {
    return this.select((x) =>
      invokeForValidNumber(x, (y: number) => Math.exp(y), handleAsInt),
    );
  }

  /** @inheritdoc */
  public first(predicate?: Predicate<T>): T {
    predicate = toPredicateSafe(predicate);
    const ELEMENT_NOT_FOUND = Symbol("ELEMENT_NOT_FOUND");
    const RESULT = this.firstOrDefault(predicate, ELEMENT_NOT_FOUND);
    if (ELEMENT_NOT_FOUND === RESULT) {
      throw "Element not found";
    }
    return RESULT;
  }

  /** @inheritdoc */
  public firstOrDefault<U = symbol>(
    predicateOrDefaultValue?: Predicate<T> | T,
    defaultValue?: U,
  ): T | U {
    const ARGS = getOrDefaultArguments(
      predicateOrDefaultValue,
      defaultValue,
      arguments.length,
    );
    for (let item of this) {
      if (ARGS.predicate(item)) {
        return item;
      }
    }
    return ARGS.defaultValue;
  }

  /** @inheritdoc */
  public flatten<U = T>(): IEnumerable<U> {
    return this.selectMany((x) => {
      return !isSequence(x) ? [x] : x;
    });
  }

  /** @inheritdoc */
  public floor(): IEnumerable<number> {
    return this.select((x) => {
      return invokeForValidNumber(x, (y: number) => Math.floor(y));
    });
  }

  /** @inheritdoc */
  public forAll(action: EachAction<T>): this {
    const ERRORS = [];
    let i = -1;
    for (let item of this) {
      ++i;
      try {
        if (action) {
          action(item, i);
        }
      } catch (e) {
        ERRORS.push(new FunctionError(e, action, i));
      }
    }
    if (ERRORS.length > 0) {
      throw new AggregateError(ERRORS);
    }
    return this;
  }

  /** @inheritdoc */
  public forEach(action: EachAction<T>): this {
    let i = -1;
    for (let item of this) {
      ++i;
      if (action) {
        action(item, i);
      }
    }
    return this;
  }

  /**
   * @see _chunkInner()
   */
  public getNextChunkArray(size: number) {
    const ARR = [];
    for (let item of this) {
      ARR.push(item);
      if (ARR.length >= size) {
        break;
      }
    }
    return ARR;
  }

  /** @inheritdoc */
  public groupBy<TKey>(
    keySelector: Selector<T, TKey>,
    keyEqualityComparer?: EqualityComparer<TKey>,
  ): IEnumerable<IGrouping<TKey, T>> {
    if (!keySelector) {
      keySelector = (i) => i as unknown as TKey;
    }
    keyEqualityComparer = toEqualityComparerSafe(keyEqualityComparer);
    return from(this._groupByInner(keySelector, keyEqualityComparer));
  }

  /**
   * @see groupBy()
   */
  private *_groupByInner<TKey>(
    keySelector: Selector<T, TKey>,
    keyEqualityComparer: EqualityComparer<TKey>,
  ): Generator<Grouping<TKey, T>, void, unknown> {
    const GROUP_LIST = [];
    for (let item of this) {
      const KEY = keySelector(item);
      let grp;
      for (let g of GROUP_LIST) {
        if (keyEqualityComparer(KEY, g.key)) {
          grp = g;
          break;
        }
      }
      if (!grp) {
        grp = {
          key: KEY,
          values: <any>[],
        };
        GROUP_LIST.push(grp);
      }
      grp.values.push(item);
    }
    for (let grp of GROUP_LIST) {
      yield new Grouping(grp.key, from(grp.values));
    }
  }

  /** @inheritdoc */
  public groupJoin<
    TInner = T,
    TOuterKey = any,
    TInnerKey = any,
    TResult = JoinedItems<T, IEnumerable<TInner>>,
  >(
    inner: Sequence<TInner>,
    outerKeySelector?: Selector<T, TOuterKey>,
    innerKeySelector?: Selector<TInner, TInnerKey>,
    resultSelector?: (outer: T, inner: IEnumerable<TInner>) => TResult,
    keyEqualityComparer?: EqualityComparer<TOuterKey, TInnerKey> | true,
  ): IEnumerable<TResult> {
    if (!outerKeySelector && !innerKeySelector) {
      outerKeySelector = (i) => i as unknown as TOuterKey;
      innerKeySelector = outerKeySelector as unknown as Selector<
        TInner,
        TInnerKey
      >;
    } else {
      if (!outerKeySelector) {
        outerKeySelector = innerKeySelector as unknown as Selector<
          T,
          TOuterKey
        >;
      } else if (!innerKeySelector) {
        innerKeySelector = outerKeySelector as unknown as Selector<
          TInner,
          TInnerKey
        >;
      }
    }
    if (!resultSelector) {
      resultSelector = (_outer: any, _inner: any) => {
        // JoinedItems<T, IEnumerable<TInner>>
        return {
          inner: _inner,
          outer: _outer,
        } as unknown as TResult;
      };
    }
    keyEqualityComparer = toEqualityComparerSafe(keyEqualityComparer);
    return from(
      this._groupJoinInner(
        from(inner),
        outerKeySelector,
        innerKeySelector,
        resultSelector,
        keyEqualityComparer,
      ),
    );
  }

  /**
   * @see groupJoin()
   */
  private *_groupJoinInner<TInner, TOuterKey, TInnerKey, TResult>(
    inner: IEnumerable<TInner>,
    outerKeySelector: Selector<T, TOuterKey>,
    innerKeySelector: Selector<TInner, TInnerKey>,
    resultSelector: (outer: T, inner: IEnumerable<TInner>) => TResult,
    keyEqualityComparer: EqualityComparer<TOuterKey, TInnerKey>,
  ): Generator<TResult, void, unknown> {
    const OUTER_GROUPS = createGroupArrayForSequence(this, outerKeySelector);
    const INNER_GROUPS = createGroupArrayForSequence(inner, innerKeySelector);
    while (OUTER_GROUPS.length > 0) {
      const OUTER_GRP = OUTER_GROUPS.shift();
      for (let i = 0; i < INNER_GROUPS.length; i++) {
        const INNER_GRP = INNER_GROUPS[i];
        if (
          !keyEqualityComparer(
            OUTER_GRP.key as TOuterKey,
            INNER_GRP.key as TInnerKey,
          )
        ) {
          continue;
        }
        for (let j = 0; j < OUTER_GRP.values.length; j++) {
          yield resultSelector(OUTER_GRP.values[j], from(INNER_GRP.values));
        }
      }
    }
  }

  /** @inheritdoc */
  public get index(): number {
    return this._index;
  }

  /** @inheritdoc */
  public indexOf<U>(item: U, comparer?: EqualityComparer<T, U> | true): number {
    let index = -1;
    comparer = toEqualityComparerSafe(comparer);
    for (let thisItem of this) {
      ++index;
      if (comparer(thisItem, item)) {
        return index;
      }
    }
    return -1;
  }

  /** @inheritdoc */
  public intersperse<U = T>(...separators: U[]): IEnumerable<T | U> {
    return from(this._intersperseInner(separators));
  }

  /**
   * @see _intersperseInner()
   */
  private *_intersperseInner<U>(
    separators: U[],
  ): Generator<T | U, void, unknown> {
    if (!separators) {
      separators = [];
    }
    let isFirst = true;
    for (let item of this) {
      // separator(s)
      if (!isFirst) {
        for (let s of separators) {
          yield s;
        }
      } else {
        isFirst = false;
      }
      yield item;
    }
  }

  /** @inheritdoc */
  public intersperseArray<U = T>(separators: Sequence<U>): IEnumerable<T | U> {
    return from(this._intersperseInner(from(separators).toArray()));
  }

  /** @inheritdoc */
  public intersect(
    second: Sequence<T>,
    comparer?: EqualityComparer<T> | true,
  ): IEnumerable<T> {
    return from(
      this._intersectInner(
        from(second).distinct().toArray(),
        toEqualityComparerSafe(comparer),
      ),
    );
  }

  /**
   * @see intersect()
   */
  private *_intersectInner(
    second: Array<T>,
    comparer: EqualityComparer<T>,
  ): Generator<T, void, unknown> {
    for (let item of this) {
      for (let secondItem of second) {
        if (comparer(item, secondItem)) {
          yield item;
          break;
        }
      }
    }
  }

  /** @inheritdoc */
  public isEmpty(): boolean {
    return this.length() < 1;
  }

  /** @inheritdoc */
  public join<
    TInner = T,
    TOuterKey = any,
    TInnerKey = any,
    TResult = JoinedItems<T, TInner>,
  >(
    inner: Sequence<TInner>,
    outerKeySelector?: Selector<T, TOuterKey>,
    innerKeySelector?: Selector<TInner, TInnerKey>,
    resultSelector?: (outer: T, inner: TInner) => TResult,
    keyEqualityComparer?: EqualityComparer<TOuterKey, TInnerKey> | true,
  ): IEnumerable<TResult> {
    if (!outerKeySelector && !innerKeySelector) {
      outerKeySelector = (i) => i as unknown as TOuterKey;
      innerKeySelector = outerKeySelector as unknown as Selector<
        TInner,
        TInnerKey
      >;
    } else {
      if (!outerKeySelector) {
        outerKeySelector = innerKeySelector as unknown as Selector<
          T,
          TOuterKey
        >;
      } else if (!innerKeySelector) {
        innerKeySelector = outerKeySelector as unknown as Selector<
          TInner,
          TInnerKey
        >;
      }
    }
    if (!resultSelector) {
      resultSelector = (_outer: any, _inner: any) => {
        // JoinedItems<T, TInner>
        return {
          inner: _inner,
          outer: _outer,
        } as unknown as TResult;
      };
    }
    keyEqualityComparer = toEqualityComparerSafe(keyEqualityComparer);
    return from(
      this._joinInner(
        from(inner),
        outerKeySelector,
        innerKeySelector,
        resultSelector,
        keyEqualityComparer,
      ),
    );
  }

  /**
   * @see join()
   */
  private *_joinInner<TInner, TOuterKey, TInnerKey, TResult>(
    inner: IEnumerable<TInner>,
    outerKeySelector: Selector<T, TOuterKey>,
    innerKeySelector: Selector<TInner, TInnerKey>,
    resultSelector: (outer: T, inner: TInner) => TResult,
    keyEqualityComparer: EqualityComparer<TOuterKey, TInnerKey>,
  ): Generator<TResult, void, unknown> {
    const OUTER_GROUPS = createGroupArrayForSequence(this, outerKeySelector);
    const INNER_GROUPS = createGroupArrayForSequence(inner, innerKeySelector);
    while (OUTER_GROUPS.length > 0) {
      const OUTER_GRP = OUTER_GROUPS.shift();
      for (let i = 0; i < INNER_GROUPS.length; i++) {
        const INNER_GRP = INNER_GROUPS[i];
        if (
          !keyEqualityComparer(
            OUTER_GRP.key as TOuterKey,
            INNER_GRP.key as TInnerKey,
          )
        ) {
          continue;
        }
        for (let j = 0; j < OUTER_GRP.values.length; j++) {
          for (let k = 0; k < INNER_GRP.values.length; k++) {
            yield resultSelector(OUTER_GRP.values[j], INNER_GRP.values[k]);
          }
        }
      }
    }
  }

  /** @inheritdoc */
  public joinToString(separator?: any): string {
    return this.toArray().join(toStringSafe(separator));
  }

  /** @inheritdoc */
  public last(predicate?: Predicate<T>): T {
    predicate = toPredicateSafe(predicate);
    const ELEMENT_NOT_FOUND = Symbol("ELEMENT_NOT_FOUND");
    const RESULT = this.lastOrDefault(predicate, ELEMENT_NOT_FOUND);
    if (ELEMENT_NOT_FOUND === RESULT) {
      throw "Element not found";
    }
    return RESULT;
  }

  /** @inheritdoc */
  public lastIndexOf<U>(
    item: U,
    comparer?: EqualityComparer<T, U> | true,
  ): number {
    let index = -1;
    let lastIndex = -1;
    comparer = toEqualityComparerSafe(comparer);
    for (let thisItem of this) {
      ++index;
      if (comparer(thisItem, item)) {
        lastIndex = index;
      }
    }
    return lastIndex;
  }

  /** @inheritdoc */
  public lastOrDefault<U = symbol>(
    predicateOrDefaultValue?: Predicate<T> | T,
    defaultValue?: U,
  ): T | U {
    const ARGS = getOrDefaultArguments(
      predicateOrDefaultValue,
      defaultValue,
      arguments.length,
    );
    const ELEMENT_NOT_FOUND = Symbol("ELEMENT_NOT_FOUND");
    let result: T | U = ELEMENT_NOT_FOUND as unknown as U;
    for (let item of this) {
      if (ARGS.predicate(item)) {
        result = item;
      }
    }
    if ((ELEMENT_NOT_FOUND as unknown as U) !== result) {
      return result;
    }
    return ARGS.defaultValue;
  }

  /** @inheritdoc */
  public length(): number {
    return this.count();
  }

  /** @inheritdoc */
  public log(base?: number, handleAsInt?: boolean): IEnumerable<number> {
    let logFunc: (n: number) => number;
    base = parseFloat(toStringSafe(base).trim());
    if (isNaN(base)) {
      logFunc = (a: number) => Math.log(a);
    } else {
      logFunc = (a: number) => Math.log(a) / Math.log(base);
    }
    return this.select((x) => {
      return invokeForValidNumber(x, (y: number) => logFunc(y), handleAsInt);
    });
  }

  /** @inheritdoc */
  public makeResettable(): IEnumerable<T> {
    if (this.canReset) {
      return this;
    }
    return from(this.toArray());
  }

  /** @inheritdoc */
  public max<U = T>(
    valueSelector?: Selector<T, U>,
    comparer?: Comparer<U>,
  ): T | symbol {
    if (!valueSelector) {
      valueSelector = (i) => i as unknown as U;
    }
    comparer = toComparerSafe(comparer);
    let result = Enumerable.IS_EMPTY as unknown as T;
    let maxValue;
    let isFirst = true;
    for (let item of this) {
      const VALUE = valueSelector(item);
      const UPDATE_RESULT = () => {
        result = item;
        maxValue = VALUE;
      };
      if (!isFirst) {
        if (comparer(VALUE, maxValue) > 0) {
          UPDATE_RESULT();
        }
      } else {
        isFirst = false;
        UPDATE_RESULT();
      }
    }
    return result;
  }

  /** @inheritdoc */
  public min<U = T>(
    valueSelector?: Selector<T, U>,
    comparer?: Comparer<U>,
  ): T | symbol {
    if (!valueSelector) {
      valueSelector = (i) => i as unknown as U;
    }
    comparer = toComparerSafe(comparer);
    let result = Enumerable.IS_EMPTY as unknown as T;
    let minValue;
    let isFirst = true;
    for (let item of this) {
      const VALUE = valueSelector(item);
      const UPDATE_RESULT = () => {
        result = item;
        minValue = VALUE;
      };
      if (!isFirst) {
        if (comparer(VALUE, minValue) < 0) {
          UPDATE_RESULT();
        }
      } else {
        isFirst = false;
        UPDATE_RESULT();
      }
    }
    return result;
  }

  /** @inheritdoc */
  public noNAN(checkForInt?: boolean): IEnumerable<T> {
    return this.where((x) => {
      const STR = toStringSafe(x).trim();
      return !isNaN(!checkForInt ? parseFloat(STR) : parseInt(STR));
    });
  }

  /** @inheritdoc */
  public not(predicate?: Predicate<T>): IEnumerable<T> {
    let predicateToUse: Predicate<T>;
    if (arguments.length < 1) {
      predicateToUse = (x: T) => !x;
    } else {
      predicate = toPredicateSafe(predicate);
      predicateToUse = (x: T) => !predicate(x);
    }
    return this.where((x) => predicateToUse(x));
  }

  /** @inheritdoc */
  public notEmpty(): IEnumerable<T> {
    return this.where((x) => !!x);
  }

  /** @inheritdoc */
  public ofType<U = any>(type: string): IEnumerable<U> {
    type = toStringSafe(type).trim();
    return this.where((x) => {
      return type.toLowerCase() === typeof x || "" === type;
    }) as unknown as IEnumerable<U>;
  }

  /** @inheritdoc */
  public order(comparer?: Comparer<T>): IOrderedEnumerable<T> {
    return this.orderBy((x) => x, comparer);
  }

  /** @inheritdoc */
  public orderBy<U>(
    selector: Selector<T, U>,
    comparer?: Comparer<U>,
  ): IOrderedEnumerable<T> {
    return new OrderedEnumerable(this, selector, comparer);
  }

  /** @inheritdoc */
  public orderByDescending<U>(
    selector: Selector<T, U>,
    comparer?: Comparer<U>,
  ): IOrderedEnumerable<T> {
    comparer = toComparerSafe(comparer);
    return this.orderBy(selector, (x, y) => {
      return comparer(y, x);
    });
  }

  /** @inheritdoc */
  public orderDescending(comparer?: Comparer<T>): IOrderedEnumerable<T> {
    return this.orderByDescending((x) => x, comparer);
  }

  /** @inheritdoc */
  public pipe(action: EachAction<T>): IEnumerable<T> {
    return from(this._pipeInner(action));
  }

  /**
   * @see pipe()
   */
  private *_pipeInner(action: EachAction<T>): Generator<T, void, unknown> {
    let i = -1;
    for (let item of this) {
      ++i;
      if (action) {
        action(item, i);
      }
      yield item;
    }
  }

  /** @inheritdoc */
  public pow(exponent?: number, handleAsInt?: boolean): IEnumerable<number> {
    exponent = parseFloat(toStringSafe(exponent).trim());
    if (isNaN(exponent)) {
      exponent = 2;
    }
    return this.select((x) => {
      return invokeForValidNumber(
        x,
        (y: number) => Math.pow(y, exponent),
        handleAsInt,
      );
    });
  }

  /** @inheritdoc */
  public prepend<U = T>(...args: Sequence<U>[]): IEnumerable<T | U> {
    return this.prependArray(args);
  }

  /** @inheritdoc */
  public prependArray<U = T>(
    sequences: ArrayLike<Sequence<U>>,
  ): IEnumerable<T | U> {
    return from(this._prependArrayInner(sequences));
  }

  /**
   * @see concatArray()
   */
  private *_prependArrayInner<U>(
    sequences: ArrayLike<Sequence<U>>,
  ): IterableIterator<T | U> {
    if (sequences) {
      for (let i = 0; i < sequences.length; i++) {
        const SEQ = sequences[i];
        for (let item of from(SEQ)) {
          yield item;
        }
      }
    }
    for (let item of this) {
      yield item;
    }
  }

  /** @inheritdoc */
  public product(): T | symbol {
    return this.aggregate(
      (acc: any, x: any) => (Enumerable.IS_EMPTY !== acc ? acc * x : x),
      Enumerable.IS_EMPTY,
    );
  }

  /** @inheritdoc */
  public pushTo(stack: Stack<T>): this {
    if (stack) {
      stack.push.apply(stack, this.toArray());
    }
    return this;
  }

  /** @inheritdoc */
  public rand(sortValueProvider?: () => any): IOrderedEnumerable<T> {
    if (!sortValueProvider) {
      sortValueProvider = () => Math.random();
    }
    return this.orderBy((x) => {
      return sortValueProvider();
    });
  }

  /** @inheritdoc */
  public reset(): this {
    throw "Not supported";
  }

  /** @inheritdoc */
  public reverse(): IOrderedEnumerable<T> {
    let i = Number.MIN_SAFE_INTEGER;
    return this.orderByDescending(() => {
      return i++;
    });
  }

  /** @inheritdoc */
  public root(power?: number, handleAsInt?: boolean): IEnumerable<number> {
    power = parseFloat(toStringSafe(power).trim());
    if (isNaN(power)) {
      power = 2;
    }
    return this.select((x) => {
      return invokeForValidNumber(
        x,
        (y: number) => Math.pow(y, 1 / power),
        handleAsInt,
      );
    });
  }

  /** @inheritdoc */
  public round(): IEnumerable<number> {
    return this.select((x) => {
      return invokeForValidNumber(x, (y: number) => Math.round(y));
    });
  }

  /** @inheritdoc */
  public select<U>(selector: Selector<T, U>): IEnumerable<U> {
    if (!selector) {
      selector = (x) => x as unknown as U;
    }
    return this.selectMany((x) => {
      return [selector(x)];
    });
  }

  /** @inheritdoc */
  public selectMany<U>(selector: Selector<T, Sequence<U>>): IEnumerable<U> {
    return from(this._selectManyInner(selector));
  }

  /**
   * @see selectMany()
   */
  private *_selectManyInner<U>(
    selector: Selector<T, Sequence<U>>,
  ): IterableIterator<U> {
    if (!selector) {
      selector = (x) => [x as unknown as U];
    }
    for (let s of this) {
      const SEQ = from(selector(s));
      for (let item of SEQ) {
        yield item;
      }
    }
  }

  /** @inheritdoc */
  public sequenceEqual<U>(
    other: Sequence<U>,
    equalityComparer?: EqualityComparer<T, U> | true,
  ): boolean {
    const OTHER_SEQ = from(other);
    equalityComparer = toEqualityComparerSafe(equalityComparer);
    do {
      const X = getNextIteratorResultSafe(this);
      if (X.done) {
        break;
      }
      const Y = getNextIteratorResultSafe(OTHER_SEQ);
      if (Y.done) {
        return false;
      }
      if (!equalityComparer(X.value, Y.value)) {
        return false;
      }
    } while (true);
    if (!getNextIteratorResultSafe(OTHER_SEQ).done) {
      return false;
    }
    return true;
  }

  /** @inheritdoc */
  public shuffle(sortValueProvider?: () => any): any {
    return this.rand.apply(this, arguments);
  }

  /** @inheritdoc */
  public sin(handleAsInt?: boolean): IEnumerable<number> {
    return this.select((x) =>
      invokeForValidNumber(x, (y: number) => Math.sin(y), handleAsInt),
    );
  }

  /** @inheritdoc */
  public single(predicate?: Predicate<T>): T {
    predicate = toPredicateSafe(predicate);
    const ELEMENT_NOT_FOUND = Symbol("ELEMENT_NOT_FOUND");
    const ITEM = this.singleOrDefault(predicate, ELEMENT_NOT_FOUND);
    if (ELEMENT_NOT_FOUND === ITEM) {
      throw "Element not found";
    }
    return ITEM;
  }

  /** @inheritdoc */
  public singleOrDefault<U = symbol>(
    predicateOrDefaultValue?: Predicate<T> | T,
    defaultValue?: U,
  ): T | U {
    const ARGS = getOrDefaultArguments(
      predicateOrDefaultValue,
      defaultValue,
      arguments.length,
    );
    const ELEMENT_NOT_FOUND = Symbol("ELEMENT_NOT_FOUND");
    let result = ELEMENT_NOT_FOUND as unknown as T;
    for (let item of this) {
      if (!ARGS.predicate(item)) {
        continue;
      }
      if ((ELEMENT_NOT_FOUND as unknown as T) !== result) {
        throw "Sequence contains more that one matching element";
      }
      result = item;
    }
    if ((ELEMENT_NOT_FOUND as unknown as T) !== result) {
      return result;
    }
    return ARGS.defaultValue;
  }

  /** @inheritdoc */
  public sinH(handleAsInt?: boolean): IEnumerable<number> {
    return this.select((x) =>
      invokeForValidNumber(x, (y: number) => Math.sinh(y), handleAsInt),
    );
  }

  /** @inheritdoc */
  public skip(count?: number): IEnumerable<T> {
    count = parseInt(toStringSafe(count).trim());
    if (isNaN(count)) {
      count = 1;
    }
    return this.skipWhile(() => {
      return count-- > 0;
    });
  }

  /** @inheritdoc */
  public skipLast(): IEnumerable<T> {
    return from(this._skipLastInner());
  }

  /**
   * @see skipLast()
   */
  private *_skipLastInner(): Generator<T, void, unknown> {
    let hasRemainingItems;
    let isFirst = true;
    let item;
    do {
      const ITERATOR_ITEM = this.next();
      hasRemainingItems = ITERATOR_ITEM && !ITERATOR_ITEM.done;
      if (!hasRemainingItems) {
        continue;
      }
      if (!isFirst) {
        yield item;
      } else {
        isFirst = false;
      }
      item = ITERATOR_ITEM.value;
    } while (hasRemainingItems);
  }

  /** @inheritdoc */
  public skipWhile(predicate: Predicate<T>): IEnumerable<T> {
    return from(this._skipWhileInner(predicate));
  }

  /**
   * @see takeWhile()
   */
  private *_skipWhileInner(
    predicate: Predicate<T>,
  ): Generator<T, void, unknown> {
    predicate = toPredicateSafe(predicate);
    let returnItem = false;
    for (let item of this) {
      if (!returnItem && !predicate(item)) {
        returnItem = true;
      }
      if (returnItem) {
        yield item;
      }
    }
  }

  /** @inheritdoc */
  public sqrt(handleAsInt?: boolean): IEnumerable<number> {
    return this.select((x) =>
      invokeForValidNumber(x, (y) => Math.sqrt(y), handleAsInt),
    );
  }

  /** @inheritdoc */
  public sum(): T | symbol {
    return this.aggregate(
      (acc: any, x: any) => (Enumerable.IS_EMPTY !== acc ? acc + x : x),
      Enumerable.IS_EMPTY,
    );
  }

  /** @inheritdoc */
  public take(count?: number): IEnumerable<T> {
    count = parseInt(toStringSafe(count).trim());
    if (isNaN(count)) {
      count = 1;
    }
    return this.takeWhile(() => {
      return count-- > 0;
    });
  }

  /** @inheritdoc */
  public takeWhile(predicate: Predicate<T>): IEnumerable<T> {
    return from(this._takeWhileInner(predicate));
  }

  /**
   * @see takeWhile()
   */
  private *_takeWhileInner(
    predicate: Predicate<T>,
  ): Generator<T, void, unknown> {
    predicate = toPredicateSafe(predicate);
    for (let item of this) {
      if (predicate(item)) {
        yield item;
      } else {
        break;
      }
    }
  }

  /** @inheritdoc */
  public tan(handleAsInt?: boolean): IEnumerable<number> {
    return this.select((x) =>
      invokeForValidNumber(x, (y: number) => Math.tan(y), handleAsInt),
    );
  }

  /** @inheritdoc */
  public tanH(handleAsInt?: boolean): IEnumerable<number> {
    return this.select((x) =>
      invokeForValidNumber(x, (y: number) => Math.tanh(y), handleAsInt),
    );
  }

  /** @inheritdoc */
  public toArray(): Array<T> {
    const ARR = [];
    for (let i of this) {
      ARR.push(i);
    }
    return ARR;
  }

  /** @inheritdoc */
  public toLookup<TKey extends PropertyKey, U = any>(
    keySelector: Selector<T, TKey>,
    keyEqualityComparer?: EqualityComparer<TKey>,
  ): U {
    const LOOKUP: Record<PropertyKey, any> = {};
    for (let grp of this.groupBy(keySelector, keyEqualityComparer)) {
      LOOKUP[grp.key] = grp;
    }
    return LOOKUP;
  }

  /** @inheritdoc */
  public toObject<TResult = any, TKey extends PropertyKey = number>(
    keySelector?: (item: T, index: number) => TKey,
  ): TResult {
    if (!keySelector) {
      keySelector = (item, index) => index as unknown as TKey;
    }
    const OBJ: Record<PropertyKey, any> = {};
    let i = -1;
    for (let item of this) {
      ++i;
      OBJ[keySelector(item, i)] = item;
    }
    return OBJ;
  }

  /** @inheritdoc */
  public trace(formatter?: Selector<T, any>): IEnumerable<T> {
    if (!formatter) {
      formatter = (item) => {
        if (isNullOrUndefined(item)) {
          return item;
        }
        return "" + item;
      };
    }
    return this.pipe((x) => {
      console.trace(formatter(x));
    });
  }

  /** @inheritdoc */
  public union(
    second: Sequence<T>,
    comparer?: EqualityComparer<T> | true,
  ): IEnumerable<T> {
    return this.concat(second).distinct(comparer);
  }

  /** @inheritdoc */
  public where(predicate: Predicate<T>): IEnumerable<T> {
    return from(this._whereInner(predicate));
  }

  /**
   * @see where()
   */
  private *_whereInner(predicate: Predicate<T>): IterableIterator<T> {
    predicate = toPredicateSafe(predicate);
    for (let item of this) {
      if (predicate(item)) {
        yield item;
      }
    }
  }

  /** @inheritdoc */
  public zip<U = T, TResult = any>(
    second: Sequence<U>,
    resultSelector: ZipSelector<T, U, TResult>,
  ): IEnumerable<TResult> {
    if (!resultSelector) {
      resultSelector = (x: any, y: any) => x + y;
    }
    return from(this.zipInner(from(second), resultSelector));
  }

  /**
   * @see zip()
   */
  private *zipInner<U, TResult>(
    second: Iterator<U>,
    resultSelector: ZipSelector<T, U, TResult>,
  ): Generator<TResult, void, unknown> {
    let i = -1;
    do {
      const ITEM_THIS = getNextIteratorResultSafe(this);
      if (ITEM_THIS.done) {
        break;
      }
      const ITEM_SECOND = getNextIteratorResultSafe(second);
      if (ITEM_SECOND.done) {
        break;
      }
      yield resultSelector(ITEM_THIS.value, ITEM_SECOND.value, ++i);
    } while (true);
  }
} // EnumerableBase<T>
Enumerable.EnumerableBase = EnumerableBase;

/**
 * Wraps a sequence.
 *
 * @template T Type of the items.
 */
class EnumerableWrapper<T = any> extends EnumerableBase<T> {
  /**
   * The wrapped sequence.
   */
  protected _sequence: IEnumerable<T>;

  /**
   * Intializes a new instance of that class.
   *
   * @param {IEnumerable<T>} [seq] The sequence to wrap.
   */
  constructor(seq?: IEnumerable<T>) {
    super();
    this._sequence = seq;
  }

  /** @inheritdoc */
  public get canReset(): boolean {
    return this._sequence.canReset;
  }

  /** @inheritdoc */
  public get current(): IteratorResult<T, any> {
    return this._sequence.current;
  }

  /** @inheritdoc */
  public next(): IteratorResult<T, any> {
    return this._sequence.next();
  }

  /** @inheritdoc */
  public reset(): this {
    this._sequence.reset();
    return this;
  }
} // EnumerableWrapper<T>
Enumerable.EnumerableWrapper = EnumerableWrapper;

/**
 * A sequence based on an Iterator<T>.
 */
class IteratorEnumerable<T = any> extends EnumerableBase<T> {
  /**
   * Stores the inner iterator.
   */
  protected _iterator: Iterator<T>;

  /**
   * Initializes a new instance of that class.
   *
   * @param {Iterator<T>} [iterator] The underlying iterator.
   */
  constructor(iterator?: Iterator<T>) {
    super();
    this._iterator = iterator;
    if (isNullOrUndefined(this._iterator)) {
      this._iterator = emptyIterator();
    }
  }

  /** @inheritdoc */
  public next(value?: any): IteratorResult<T> {
    let result = this._iterator.next(value);
    if (!result) {
      result = {
        value: undefined,
        done: true,
      };
    }
    this._current = result;
    if (!result.done) {
      ++this._index;
    }
    return result;
  }
} // IteratorEnumerable<T>
Enumerable.IteratorEnumerable = IteratorEnumerable;

/**
 * A sequence based on an array.
 */
class ArrayEnumerable<T = any> extends EnumerableBase<T> {
  /**
   * Stores the underlying array.
   */
  protected _array: ArrayLike<T>;

  /**
   * Initializes a new instance of that class.
   *
   * @param {ArrayLike<T>} [arr] The underlying array.
   */
  constructor(arr?: ArrayLike<T>) {
    super();
    this._array = arr;
    if (isNullOrUndefined(this._array)) {
      this._array = [];
    }
  }

  /** @inheritdoc */
  public get canReset(): boolean {
    return true;
  }

  /** @inheritdoc */
  public length(): number {
    return this._array.length;
  }

  /** @inheritdoc */
  public next(): IteratorResult<T> {
    let result;
    const NEXT_INDEX = this._index + 1;
    if (NEXT_INDEX >= this._array.length) {
      result = {
        done: true,
        value: undefined,
      };
    } else {
      this._index = NEXT_INDEX;
      result = {
        done: false,
        value: this._array[NEXT_INDEX],
      };
    }
    this._current = result;
    return result;
  }

  /** @inheritdoc */
  public reset(): this {
    if (this.canReset) {
      this._index = -1;
    } else {
      return super.reset();
    }
    return this;
  }
} // ArrayEnumerable<T>
Enumerable.ArrayEnumerable = ArrayEnumerable;

/**
 * A grouping.
 *
 * @template T Type of the items.
 * @template TKey Type of the key.
 */
class Grouping<TKey = any, T = any>
  extends EnumerableWrapper<T>
  implements IGrouping<TKey, T>
{
  /**
   * Stores the key.
   */
  protected _key: TKey;

  /**
   * Initializes a new instance of that class.
   *
   * @param {TKey} key The key.
   * @param {IEnumerable} seq The items of the grouping.
   */
  constructor(key: TKey, seq: IEnumerable<T>) {
    super(seq);
    this._key = key;
  }

  /** @inheritdoc */
  public get key(): TKey {
    return this._key;
  }
} // Grouping<TKey, T>
Enumerable.Grouping = Grouping;

/**
 * An ordered sequence.
 *
 * @template T Type of the items.
 * @template U Type of the sort keys.
 */
class OrderedEnumerable<T = any, U = T>
  extends EnumerableWrapper<T>
  implements IOrderedEnumerable<T>
{
  /**
   * Stores the items in the original order.
   */
  protected _originalItems: Array<T>;
  /**
   * Stores the comparer for the sort keys.
   */
  protected _orderComparer: Comparer<U, U>;
  /**
   * Stores the selector for the keys.
   */
  protected _orderSelector: Selector<T, U>;

  /**
   * Initializes a new instance of that class.
   *
   * @param {IEnumerable<T>} seq The source sequence.
   * @param {Selector<T,U>} selector The selector for the sort values.
   * @param {Comparer<U,U>} comparer The comparer to use.
   */
  constructor(
    seq: IEnumerable<T>,
    selector: Selector<T, U>,
    comparer: Comparer<U, U>,
  ) {
    super(seq);
    const ME = this;
    this._orderComparer = toComparerSafe(comparer);
    if (!selector) {
      selector = (i) => i as unknown as U;
    }
    this._orderSelector = selector;
    this._originalItems = seq.toArray();
    this._sequence = from(
      this._originalItems
        .map((x) => {
          return {
            sortBy: ME.selector(x),
            value: x,
          };
        })
        .sort(function (x, y) {
          return ME.comparer(x.sortBy, y.sortBy);
        })
        .map(function (x) {
          return x.value;
        }),
    );
  }

  /**
   * Gets the comparer.
   */
  public get comparer(): Comparer<U, U> {
    return this._orderComparer;
  }

  /**
   * Gets the selector.
   */
  public get selector(): (x: T) => any {
    return this._orderSelector;
  }

  /** @inheritdoc */
  public then(comparer?: Comparer<T>): IOrderedEnumerable<T> {
    return this.thenBy((x) => x, comparer);
  }

  /** @inheritdoc */
  public thenBy<U>(
    selector: Selector<T, U>,
    comparer?: Comparer<U, U>,
  ): IOrderedEnumerable<T> {
    if (!selector) {
      selector = (i) => i as unknown as U;
    }
    comparer = toComparerSafe(comparer);
    const THIS_SELECTOR = this.selector;
    const THIS_COMPARER = this.comparer;
    return from(this._originalItems).orderBy(
      (x) => {
        return {
          level_0: THIS_SELECTOR(x),
          level_1: selector(x),
        };
      },
      (x, y) => {
        const COMP_0 = THIS_COMPARER(x.level_0, y.level_0);
        if (0 != COMP_0) {
          return COMP_0;
        }
        const COMP_1 = comparer(x.level_1, y.level_1);
        if (0 != COMP_1) {
          return COMP_1;
        }
        return 0;
      },
    );
  }

  /** @inheritdoc */
  public thenByDescending<U>(
    selector: Selector<T, U>,
    comparer?: Comparer<U, U>,
  ): IOrderedEnumerable<T> {
    if (!selector) {
      selector = (i) => i as unknown as U;
    }
    comparer = toComparerSafe(comparer);
    return this.thenBy(selector, (x, y) => comparer(y, x));
  }

  /** @inheritdoc */
  public thenDescending(comparer?: Comparer<T>): IOrderedEnumerable<T> {
    return this.thenByDescending((x) => x, comparer);
  }
} // OrderedEnumerable<T, U = T>
Enumerable.OrderedEnumerable = OrderedEnumerable;

/**
 * Keeps sure that a value is a sequence.
 *
 * @param {any} val The value to cast (if needed).
 *
 * @return {IEnumerable<T>} The value as sequence. Can return (null) or (undefined), if 'val' is one of these values.
 */
function asEnumerable<T = any>(val: any): IEnumerable<T> {
  if (isNullOrUndefined(val)) {
    return val;
  }
  if (isEnumerable(val)) {
    return val;
  }
  return from(val);
}
Enumerable.asEnumerable = asEnumerable;

/**
 * Returns a value as function.
 *
 * @param {any} val The function or a value that can be converted to a lambda expression string.
 * @param {boolean} throwException Throw an exception on parse errors or return (false).
 *
 * @return {T} 'val' as function or (false) on error, if 'throwException' is (false).
 *             Can be (null) or (undefined) if 'val' has a same value or is an empty string (representation).
 */
function asFunc<T extends Function = Function>(
  val: any,
  throwException: boolean = true,
): T | false {
  if ("function" === typeof val) {
    return val;
  }
  if (isNullOrUndefined(val)) {
    return val;
  }
  const LAMBDA = toStringSafe(val);
  if ("" === LAMBDA.trim()) {
    return undefined;
  }
  const MATCHES = LAMBDA.match(/^(\s*)([\(]?)([^\)]*)([\)]?)(\s*)(=>)/m);
  if (MATCHES) {
    if (
      ("" === MATCHES[2] && "" !== MATCHES[4]) ||
      ("" !== MATCHES[2] && "" === MATCHES[4])
    ) {
      if (throwException) {
        throw "Syntax error in '" + LAMBDA + "' expression";
      }
      return false;
    }
    let lambdaBody = LAMBDA.substr(MATCHES[0].length).trim();
    if ("" !== lambdaBody) {
      if (";" !== lambdaBody.substr(-1)) {
        lambdaBody = "return " + lambdaBody + ";";
      }
    }
    let func;
    eval("func = function(" + MATCHES[3] + ") { " + lambdaBody + " };");
    return func;
  }
  if (throwException) {
    throw "'" + val + "' is no valid lambda expression";
  }
  return false;
}
Enumerable.asFunc = asFunc;

/**
 * Builds a sequence.
 *
 * @template T Type of the items.
 *
 * @param {CancelableFactory<T>} factory The factory function.
 * @param {number} [count] The maximum number of items.
 *
 * @returns {IEnumerable<T>}
 */
function build<T = any>(
  factory: CancelableFactory<T>,
  count?: number,
): IEnumerable<T> {
  count = parseInt(toStringSafe(count).trim());
  return from(buildInner(factory, count));
} // build<T>()
Enumerable.build = build;
function* buildInner<T>(factory: CancelableFactory<T>, count?: number) {
  let i = -1;
  let run = true;
  while (run) {
    ++i;
    if (!isNaN(count)) {
      if (i >= count) {
        run = false;
        continue;
      }
    }
    const CANCEL = function (flag?: boolean) {
      if (arguments.length < 1) {
        flag = true;
      }
      run = !flag;
    };
    const NEW_ITEM = factory(CANCEL, i);
    if (run) {
      yield NEW_ITEM;
    }
  }
}

/**
 * Builds a flatten sequence of sequences.
 *
 * @template T Type of the items.
 * @param {CancelableFactory<Sequence<T>>} factory The factory.
 * @param {number} [count] The maximum number of invocations.
 *
 * @returns {IEnumerable<T>} The flatten list of items.
 */
function buildMany<T = any>(
  factory: CancelableFactory<Sequence<T>>,
  count?: number,
): IEnumerable<T> {
  count = parseInt(toStringSafe(count).trim());
  return from(buildManyInner(factory, count));
} // buildMany<T>()
Enumerable.buildMany = buildMany;
function* buildManyInner<T = any>(
  factory: CancelableFactory<Sequence<T>>,
  count?: number,
) {
  let i = -1;
  let run = true;
  while (run) {
    ++i;
    if (!isNaN(count)) {
      if (i >= count) {
        run = false;
        continue;
      }
    }
    const CANCEL = function (flag?: boolean) {
      if (arguments.length < 1) {
        flag = true;
      }
      run = !flag;
    };
    const SEQ = factory(CANCEL, i) as Iterable<T>;
    if (run) {
      if (!isNullOrUndefined(SEQ)) {
        for (let item of SEQ) {
          yield item;
        }
      }
    }
  }
}

/**
 * Creates a new sequence from a list of items.
 *
 * @template T Type of the items.
 *
 * @param {...Array<T>} items The items for the sequence.
 *
 * @returns {IEnumerable<T>} The new sequence.
 */
function create<T = any>(...items: Array<T>): IEnumerable<T> {
  return from(items);
} // create<T = any>()
Enumerable.create = create;

/**
 * Creates an empty sequence.
 *
 * @template T The type of the sequence.
 *
 * @returns {IEnumerable<T>} The new, empty sequence.
 */
function empty<T = any>(): IEnumerable<T> {
  return from(emptyIterator());
} // empty<T = any>()
Enumerable.empty = empty;

/**
 * Creates a new sequence.
 *
 * @param {Sequence<T>} seq The input data.
 *
 * @return {IEnumerable<T>} The new sequence.
 */
function from<T = any>(seq?: Sequence<T>): IEnumerable<T> {
  if (isNullOrUndefined(seq)) {
    seq = [];
  }
  if (Array.isArray(seq)) {
    return new ArrayEnumerable(seq);
  }
  if ("string" === typeof seq) {
    return fromString(seq) as unknown as IEnumerable<T>;
  }
  return new IteratorEnumerable(seq as Iterator<T>);
} // from<T>()
Enumerable.from = from;

/**
 * Creates a new sequence from the string representation of a value.
 *
 * @param {any} val The value.
 *
 * @return {IEnumerable<string>} The new sequence.
 */
function fromString(val: any): IEnumerable<string> {
  return new ArrayEnumerable(toStringSafe(val).split(""));
} // fromString()
Enumerable.fromString = fromString;

function invokeForValidNumber(
  x: any,
  action: (n: number) => number,
  handleAsInt = false,
) {
  if ("number" !== typeof x) {
    if (!handleAsInt) {
      x = parseFloat(toStringSafe(x).trim());
    } else {
      x = parseInt(toStringSafe(x).trim());
    }
  }
  if (!isNaN(x)) {
    if (action) {
      x = action(x);
    }
  }
  return x;
} // invokeForNumber()

/**
 * Checks if a value represents the IS_EMPTY symbol.
 *
 * @param {any} val The value to check.
 *
 * @returns {boolean} Is IS_EMPTY symbol or not.
 */
function isEmpty(val: any): val is symbol {
  return Enumerable.IS_EMPTY === val;
} // isEmpty()
Enumerable.isEmpty = isEmpty;

/**
 * Checks if a value represents an enumerable (sequence).
 *
 * @param {any} val The value to check.
 *
 * @returns {boolean} Is enumerable (sequence) or not.
 */
function isEnumerable<T = any>(val: any): val is IEnumerable<T> {
  if (!isNullOrUndefined(val)) {
    return val["IS_ENUMERABLE"] === Enumerable.IS_ENUMERABLE;
  }
  return false;
} // isEnumerable()
Enumerable.isEnumerable = isEnumerable;

/**
 * Checks if a sequence is (null) or empty.
 *
 * @param {IEnumerable<T>} seq The sequence to check.
 *
 * @return {boolean} Is (null) or empty.
 */
function isNullOrEmpty<T = any>(
  seq: IEnumerable<T> | null,
): seq is null | IEnumerable<T> {
  return null === seq || ("undefined" !== typeof seq && seq.isEmpty());
} // isNullOrEmpty<T>()
Enumerable.isNullOrEmpty = isNullOrEmpty;

/**
 * Checks if a value can be used as enumerable (sequence).
 *
 * @param {any} val The value to check.
 *
 * @return {boolean} Is sequence or not.
 */
function isSequence<T = any>(val: any): val is Sequence<T> {
  if (!isNullOrUndefined(val)) {
    if ("function" === typeof val[Symbol.iterator]) {
      // Iterator<T>
      return true;
    }
    if (Array.isArray(val)) {
      return true;
    }
    if ("string" === typeof val) {
      return true;
    }
  }
  return false;
} // isSequence()
Enumerable.isSequence = isSequence;

/**
 * Checks if a sequence is (undefined) / (null) or empty.
 *
 * @param {IEnumerable<T>} seq The sequence to check.
 *
 * @return {boolean} Is (undefined), (null) or empty.
 */
function isUndefinedNullOrEmpty<T = any>(
  seq: IEnumerable<T> | null | undefined,
): seq is undefined | null | IEnumerable<T> {
  return "undefined" === typeof seq || null === seq || seq.isEmpty();
} // isUndefinedNullOrEmpty<T>()
Enumerable.isUndefinedNullOrEmpty = isUndefinedNullOrEmpty;

/**
 * Checks if a sequence is (undefined) or empty.
 *
 * @param {IEnumerable<T>} seq The sequence to check.
 *
 * @return {boolean} Is (undefined) or empty.
 */
function isUndefinedOrEmpty<T = any>(
  seq: IEnumerable<T> | undefined,
): seq is undefined | IEnumerable<T> {
  return "undefined" === typeof seq || (null !== seq && seq.isEmpty());
} // isUndefinedOrEmpty<T>()
Enumerable.isUndefinedOrEmpty = isUndefinedOrEmpty;

/**
 * Checks if a value represents the NOT_FOUND symbol.
 *
 * @param {any} val The value to check.
 *
 * @returns {boolean} Is NOT_FOUND symbol or not.
 */
function notFound(val: any): val is symbol {
  return Enumerable.NOT_FOUND === val;
} // notFound()
Enumerable.notFound = notFound;

/**
 * Creates a sequence from a stack by popping its elements.
 *
 * @param {PoppableStack<T>} stack The stack from where to pop.
 *
 * @return {IEnumerable<T>} The new sequence.
 */
function popFrom<T = any>(stack: PoppableStack<T>): IEnumerable<T> {
  return from(popFromInner(stack));
} // popFrom()
Enumerable.popFrom = popFrom;
function* popFromInner<T = any>(
  stack: PoppableStack<T>,
): Generator<T, void, unknown> {
  if (stack) {
    while (stack.length > 0) {
      yield stack.pop();
    }
  }
}

/**
 * Returns a sequence of random numbers.
 *
 * @param {number} [count] The maximum number of items.
 *                         If not defined, the sequence will become infinitely.
 * @param {(randomValue: number, index: number) => number} [valueProvider] A custom function for providing a random number.
 *
 * @return {IEnumerable<number>} The sequence of random numbers.
 */
function random(
  count?: number,
  valueProvider?: (randomValue: number, index: number) => number,
): IEnumerable<number> {
  if (!valueProvider) {
    valueProvider = (randVal) => randVal;
  }
  return build((cancel, index) => valueProvider(Math.random(), index), count);
}
Enumerable.random = random;

/**
 * Creates a range of numbers.
 *
 * @param {number} start The start value.
 * @param {number} [count] The meximum number of values.
 *
 * @returns {IEnumerable<number>} The new sequence.
 */
function range(start: number, count?: number): IEnumerable<number> {
  start = parseFloat(toStringSafe(start).trim());
  if (isNaN(start)) {
    start = 0;
  }
  count = parseInt(toStringSafe(count).trim());
  return from(rangeInner(start, count));
} // range()
Enumerable.range = range;
function* rangeInner(start: number, count?: number) {
  let current = start;
  while (true) {
    if (!isNaN(count)) {
      if (count-- < 1) {
        break;
      }
    }
    yield current++;
  }
}

/**
 * Creates a range of numbers.
 *
 * @param {T} item The item to repeat.
 * @param {number} [count] The maximum number of items.
 *
 * @returns {IEnumerable<number>} The new sequence.
 */
function repeat<T = any>(item: T, count?: number): IEnumerable<T> {
  count = parseInt(toStringSafe(count).trim());
  return from(repeatInner(item, count));
} // repeat<T>()
Enumerable.repeat = repeat;
function* repeatInner<T = any>(item: T, count?: number) {
  while (true) {
    if (!isNaN(count)) {
      if (count-- < 1) {
        break;
      }
    }
    yield item;
  }
}

/**
 * Creates a sequence from a stack by shifting its elements.
 *
 * @param {PoppableStack<T>} stack The stack from where to shift.
 *
 * @return {IEnumerable<T>} The new sequence.
 */
function shiftFrom<T = any>(stack: ShiftableStack<T>): IEnumerable<T> {
  return from(shiftFromInner(stack));
} // shiftFrom()
Enumerable.shiftFrom = shiftFrom;
function* shiftFromInner<T = any>(stack: ShiftableStack<T>) {
  if (stack) {
    while (stack.length > 0) {
      yield stack.shift();
    }
  }
}

/**
 * Returns a sorted sequence.
 *
 * @template T Type of the items.
 * @template U Type of the keys.
 *
 * @param {Sequence<T>} items The items to sort.
 * @param {Selector<T,U>} [selector] The selector for the keys.
 * @param {Comparer<U>} [comparer] The custom comparer for the keys.
 *
 * @return {IOrderedEnumerable<T>} The sorted sequence.
 */
function sort<T = any, U = T>(
  items: Sequence<T>,
  selector?: Selector<T, U>,
  comparer?: Comparer<U>,
): IOrderedEnumerable<T> {
  if (!selector) {
    return from(items).order(comparer as unknown as Comparer<T>);
  }
  return from(items).orderBy(selector, comparer);
}
Enumerable.sort = sort;

/**
 * Returns a sorted sequence (descending).
 *
 * @template T Type of the items.
 * @template U Type of the keys.
 *
 * @param {Sequence<T>} items The items to sort.
 * @param {Selector<T,U>} [selector] The selector for the keys.
 * @param {Comparer<U>} [comparer] The custom comparer for the keys.
 *
 * @return {IOrderedEnumerable<T>} The sorted sequence.
 */
function sortDesc<T = any, U = T>(
  items: Sequence<T>,
  selector?: Selector<T, U>,
  comparer?: Comparer<U>,
): IOrderedEnumerable<T> {
  if (!selector) {
    return from(items).orderDescending(comparer as unknown as Comparer<T>);
  }
  return from(items).orderByDescending(selector, comparer);
}
Enumerable.sortDesc = sortDesc;

function createGroupArrayForSequence(
  seq: IEnumerable<any>,
  keySelector: Selector<any, unknown>,
) {
  return seq
    .groupBy(keySelector)
    .select((grp) => {
      return {
        key: grp.key,
        values: grp.toArray(),
      };
    })
    .toArray();
}

function* emptyIterator(): Generator<undefined, void, unknown> {
  while (false) {
    yield undefined;
  }
}

function getOrDefaultArguments(
  predicateOrDefaultValue: Predicate<any> | any,
  defaultValue?: any,
  paramCount?: number,
) {
  let predicate;
  let defVal;
  if (paramCount < 1) {
    defVal = Enumerable.NOT_FOUND;
  } else if (paramCount < 2) {
    if ("function" === typeof predicateOrDefaultValue) {
      predicate = predicateOrDefaultValue;
      defVal = Enumerable.NOT_FOUND;
    } else {
      defVal = predicateOrDefaultValue;
    }
  } else {
    predicate = predicateOrDefaultValue;
    defVal = defaultValue;
  }

  return {
    defaultValue: defVal,
    predicate: toPredicateSafe(predicate),
  };
}

function getNextIteratorResultSafe<T, TResult = any>(
  iterator: Iterator<T, TResult>,
  defaultValue?: TResult,
) {
  const RESULT = iterator.next();
  return (
    RESULT || {
      done: true,
      value: defaultValue,
    }
  );
}

function isNullOrUndefined(val: any): val is null | undefined {
  return null === val || "undefined" === typeof val;
}

function toComparerSafe(comparer: Comparer<any, any>) {
  if (!comparer) {
    comparer = (x, y) => {
      if (x === y) {
        return 0;
      }
      if (x < y) {
        return -1;
      }
      if (x > y) {
        return 1;
      }
      return 0;
    };
  }
  return comparer;
}

function toEqualityComparerSafe(comparer: EqualityComparer<any, any> | true) {
  if (!comparer) {
    comparer = (x, y) => x == y;
  } else if (true === comparer) {
    comparer = (x, y) => x === y;
  }
  return comparer;
}

function toItemMessageSafe(msgOrProvider: ItemMessage<any>) {
  let _msgProvider: (item: any, index?: number) => any;

  if (isNullOrUndefined(msgOrProvider)) {
    _msgProvider = (item, index) => `Condition failed at index ${index}`;
  } else if ("function" !== typeof msgOrProvider) {
    const MSG = msgOrProvider;
    _msgProvider = () => MSG;
  } else {
    _msgProvider = msgOrProvider;
  }
  return (item?: any, index?: number) => {
    return toStringSafe(_msgProvider(item, index));
  };
}

function toPredicateSafe(
  predicate?: Predicate<any>,
  defaultValue = true,
): Predicate<any> {
  if (isNullOrUndefined(predicate)) {
    predicate = () => !!defaultValue;
  }
  if ("function" !== typeof predicate) {
    const RESULT = !!predicate;
    predicate = () => RESULT;
  }
  return predicate;
}

function toStringSafe(val: any): string {
  if ("string" === typeof val) {
    return val;
  }
  if (isNullOrUndefined(val)) {
    val = "";
  }
  return "" + val;
}

export = Enumerable;
