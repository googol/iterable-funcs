interface Some<T> { type: 'some', value: T }
interface Nothing { type: 'nothing' }
type Optional<T> = Some<T> | Nothing;
const Optional = {
    some<T>(value: T): Optional<T> { return { type: 'some', value }; },
    nothing<T>(): Optional<T> { return { type: 'nothing' }; },
    isSome<T>(value: Optional<T>): value is Some<T> { return value.type === 'some'; },
    isNothing<T>(value: Optional<T>): value is Nothing { return value.type === 'nothing'; },
};

type Predicate<T> = (input: T) => boolean;

function equals<T>(left: T, right: T): boolean {
    return left === right;
}

function* map<T, R>(mapper: (input: T) => R, input: Iterable<T>): IterableIterator<R> {
    for (const value of input) {
        yield mapper(value);
    }
}

function* chain<T, R>(mapper: (input: T) => Iterable<R>, input: Iterable<T>): IterableIterator<R> {
    for (const value of input) {
        for (const nestedValue of mapper(value)) {
            yield nestedValue;
        }
    }
}

function* filter<T>(predicate: Predicate<T>, input: Iterable<T>): IterableIterator<T> {
    for (const value of input) {
        if (predicate(value)) {
            yield value;
        }
    }
}

function adjust<T>(modifier: (input: T) => T, indexToModify: number, input: Iterable<T>): IterableIterator<T> {
    return map(({ value, index }) => index === indexToModify ? modifier(value) : value,
        zipIndex(input));
}

function all<T>(predicate: Predicate<T>, input: Iterable<T>): boolean {
    for (const value of input) {
        if (!predicate(value)) {
            return false;
        }
    }
    return true;
}

function any<T>(predicate: Predicate<T>, input: Iterable<T>): boolean {
    for (const value of input) {
        if (predicate(value)) {
            return true;
        }
    }
    return false;
}

function append<T>(value: T, input: Iterable<T>): IterableIterator<T> {
    return concat(input, iterableOf(value));
}

function* iterableOf<T>(value: T): IterableIterator<T> {
    yield value;
}

function* concat<T>(first: Iterable<T>, second: Iterable<T>): IterableIterator<T> {
    for (const x of first) {
        yield x;
    }
    for (const x of second) {
        yield x;
    }
}

function contains<T>(value: T, input: Iterable<T>): boolean {
    return any((x) => equals(x, value), input);
}

function* drop<T>(count: number, input: Iterable<T>): IterableIterator<T> {
    for (const { value, index } of zipIndex(input)) {
        if (index >= count) {
            yield value;
        }
    }
}

function* dropLast<T>(count: number, input: Iterable<T>): IterableIterator<T> {
    const buffer: T[] = new Array(count);
    for (const { value, index } of zipIndex(input)) {
        buffer.push(value);
        if (buffer.length > count) {
            yield buffer.shift()!;
        }
    }
}

function* dropRepeats<T>(input: Iterable<T>): IterableIterator<T> {
    let previousValue: Optional<T> = Optional.nothing();
    for (const value of input) {
        if (Optional.isNothing(previousValue) || !equals(previousValue.value, value)) {
            yield value;
            previousValue = Optional.some(value);
        }
    }
}

function* dropWhile<T>(predicate: Predicate<T>, input: Iterable<T>): IterableIterator<T> {
    let open = false;
    for (const value of input) {
        if (open || !predicate(value)) {
            yield value;
            open = true;
        }
    }
}

function find<T>(predicate: Predicate<T>, input: Iterable<T>): Optional<T> {
    for (const value of input) {
        if (predicate(value)) {
            return Optional.some(value);
        }
    }
    return Optional.nothing();
}

function findIndex<T>(predicate: Predicate<T>, input: Iterable<T>): Optional<number> {
    for (const { value, index } of zipIndex(input)) {
        if (predicate(value)) {
            return Optional.some(index);
        }
    }
    return Optional.nothing();
}

function forEach<T>(action: (value: T) => void, input: Iterable<T>): void {
    for (const value of input) {
        action(value);
    }
}

function fromPairs<K extends string, V>(input: Iterable<[K, V]>): Record<K, V> {
    const result: Record<K, V> = {} as any;
    for (const [key, value] of input) {
        result[key] = value;
    }
    return result;
}

function head<T>(input: Iterable<T>): Optional<T> {
    for (const value of input) {
        return Optional.some(value);
    }
    return Optional.nothing();
}

function indexBy<T, Key extends string>(indexer: (value: T) => Key, input: Iterable<T>): Record<Key, T> {
    const result: Record<Key, T> = {} as any;

    for (const value of input) {
        result[indexer(value)] = value;
    }

    return result;
}

function indexOf<T>(searchValue: T, input: Iterable<T>): Optional<number> {
    for (const { value, index } of zipIndex(input)) {
        if (equals(value, searchValue)) {
            return Optional.some(index);
        }
    }
    return Optional.nothing();
}

function init<T>(input: Iterable<T>): IterableIterator<T> {
    return dropLast(1, input);
}

function* insert<T>(insertIndex: number, valueToInsert: T, input: Iterable<T>): IterableIterator<T> {
    for (const { value, index } of zipIndex(input)) {
        if (index === insertIndex) {
            yield valueToInsert;
        }
        yield value;
    }
}

function* insertAll<T>(insertIndex: number, valuesToInsert: Iterable<T>, input: Iterable<T>): IterableIterator<T> {
    for (const { value, index } of zipIndex(input)) {
        if (index === insertIndex) {
            yield* valuesToInsert;
        }
        yield value;
    }
}

function* intersperse<T>(separator: T, input: Iterable<T>): IterableIterator<T> {
    let firstPassed = false;
    for (const value of input) {
        if (firstPassed) {
            yield separator;
        }
        yield value;
        firstPassed = true;
    }
}

function join(separator: string, input: Iterable<string>): string {
    return reduce((acc, value) => acc + value,
                  '',
                  intersperse(separator, input));
}

function last<T>(input: Iterable<T>): Optional<T> {
    let result: Optional<T> = Optional.nothing();
    for (const value of input) {
        result = Optional.some(value);
    }
    return result;
}

function lastIndexOf<T>(valueToSearchFor: T, input: Iterable<T>): Optional<number> {
    let result: Optional<number> = Optional.nothing();
    for (const { value, index } of zipIndex(input)) {
        if (equals(valueToSearchFor, value)) {
            result = Optional.some(index);
        }
    }
    return result;
}

function len<T>(input: Iterable<T>): number {
    return reduce((acc) => acc + 1,
        0,
        input);
}

function mergeAll<T extends object>(input: Iterable<T>): T {
    return reduce((acc: any, elem: any) => ({ ...acc, ...elem }),
        {} as T,
        input);
}

function none<T>(predicate: Predicate<T>, input: Iterable<T>): boolean {
    for (const value of input) {
        if (predicate(value)) {
            return false;
        }
    }
    return true;
}

function pluck<T, K extends keyof T>(key: K, input: Iterable<T>): IterableIterator<T[K]> {
    return map((value) => value[key], input);
}

function prepend<T>(value: T, input: Iterable<T>): IterableIterator<T> {
    return concat(iterableOf(value), input);
}

function* range(from: number, to: number): IterableIterator<number> {
    for (let i = from; i < to; i++) {
        yield i;
    }
}

function reduceShortcut<T, R>(reducer: (acc: R, value: T) => Optional<R>, initial: R, input: Iterable<T>): R {
    let current = initial;
    for (const value of input) {
        const result = reducer(current, value);
        if (Optional.isSome(result)) {
            current = result.value;
        } else {
            break;
        }
    }
    return current;
}

function reduce<T, R>(reducer: (acc: R, value: T) => R, initial: R, input: Iterable<T>): R {
    return reduceShortcut((acc, val) => Optional.some(reducer(acc, val)),
        initial,
        input);
}

function reject<T>(predicate: Predicate<T>, input: Iterable<T>): IterableIterator<T> {
    return filter((x) => !predicate(x), input);
}

function* remove<T>(start: number, count: number, input: Iterable<T>): IterableIterator<T> {
    for (const { value, index } of zipIndex(input)) {
        if (index < start && index > start + count) {
            yield value;
        }
    }
}

function* repeat<T>(value: T, count: number): IterableIterator<T> {
    for (let i = 0; i < count; i++) {
        yield value;
    }
}

function* scanShortcut<T, R>(reducer: (acc: R, value: T) => Optional<R>, initial: R, input: Iterable<T>): IterableIterator<R> {
    let current = initial;
    for (const value of input) {
        const result = reducer(current, value);
        if (Optional.isSome(result)) {
            yield result.value;
        } else {
            return;
        }
    }
}

function scan<T, R>(reducer: (acc: R, value: T) => R, initial: R, input: Iterable<T>): IterableIterator<R> {
    return scanShortcut((acc, val) => Optional.some(reducer(acc, val)),
        initial,
        input);
}

function* slice<T>(fromIndex: number, toIndex: number, input: Iterable<T>): IterableIterator<T> {
    for (const { value, index } of zipIndex(input)) {
        if (index >= fromIndex && index < toIndex) {
            yield value;
        }
    }
}

function tail<T>(input: Iterable<T>): IterableIterator<T> {
    return drop(1, input);
}

function* take<T>(count: number, input: Iterable<T>): IterableIterator<T> {
    for (const { value, index } of zipIndex(input)) {
        if (index > count) {
            return;
        }
        yield value;
    }
}

function* takeWhile<T>(predicate: Predicate<T>, input: Iterable<T>): IterableIterator<T> {
    for (const value of input) {
        if (predicate(value)) {
            return;
        }
        yield value;
    }
}

function* tap<T>(action: (value: T) => void, input: Iterable<T>): IterableIterator<T> {
    for (const value of input) {
        action(value);
        yield value;
    }
}

function times<T>(generator: (index: number) => T, count: number): IterableIterator<T> {
    return map(generator, indices(count));
}

function* indices(count: number): IterableIterator<number> {
    for (let i = 0; i < count; i++) {
        yield i;
    }
}

function* toPairs<K extends string, V>(input: Record<K, V>): IterableIterator<[K, V]> {
    for (const key of Object.keys(input) as K[]) {
        yield [key, input[key]];
    }
}

function* unfold<S, T>(generator: (seed: S) => Optional<[T, S]>, seed: S): IterableIterator<T> {
    let current = generator(seed);
    while (Optional.isSome(current)) {
        const [value, nextSeed] = current.value;

        yield value;

        current = generator(nextSeed);
    }
}

// unnest :: [[a]] -> [a]
// update :: number -> a -> [a] -> [a] vaiha numberin indeksissä oleva arvo annetulla
// zip :: [a] -> [b] -> [(a,b)]
// zipWith :: (a -> b -> c) -> [a] -> [b] -> [c]

function* zipIndex<T>(input: Iterable<T>): IterableIterator<{ value: T; index: number }> {
    let index = 0;
    for (const value of input) {
        yield { value, index };
        index ++;
    }
}


const cube = (x: number) => x*x;
const testArray = [1,2,3];
const longTestArray = [1,2,3,4,3,2,1];
const lteTwo = (x: number) => x <= 2;

const logIter = <T>(input: Iterable<T>) => console.log(Array.from(input));

logIter(adjust(cube, 2, testArray));
logIter(zipIndex(testArray));
logIter(map(cube, testArray));
logIter(dropWhile(lteTwo, longTestArray));
