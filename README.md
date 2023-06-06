# Loadable.ts

> Type-safe loading states for TypeScript

[![NPM version](http://img.shields.io/npm/v/loadable.ts.svg?style=flat-square)](https://www.npmjs.com/package/loadable.ts)
[![NPM downloads](http://img.shields.io/npm/dm/loadable.ts.svg?style=flat-square)](https://www.npmjs.com/package/loadable.ts)
[![Build status](https://github.com/dirkluijk/loadable.ts/actions/workflows/main.yml/badge.svg?branch=master)](https://github.com/dirkluijk/loadable.ts/actions/workflows/main.yml)
[![All Contributors](https://img.shields.io/badge/all_contributors-2-orange.svg?style=flat-square)](#contributors-)

## Overview

This is a small util library to design type-safe loading states.

It includes:

* Type-safe loading interfaces
* Type-guards for loadable states
* Useful operators for RxJS
* Structural directives for Angular
* Monad helpers

## Getting started 🌩

##### npm

```
npm install loadable.ts
```

##### yarn

```
yarn add loadable.ts
```

## Type-safe loading interfaces

It introduces a `Loadable<T, E>` type that represents three possible states,
`Loading`, `Success<T>` or `Failed<E>`.

```typescript
type Loadable<T, E = unknown> = Loading | Success<T> | Failed<E>;
```

Plain TypeScript example:

```typescript
import { LOADING, success, failed, Loadable } from 'loadable.ts';

function getFoo(): Loadable<Foo> {
    if (...) {
        return LOADING;      // returns a `Loading`
    } else if (...) {
        return success(...); // returns a `Success<Foo>`
    } else {
        return failed(...);  // returns a `Failed`
    }
}

const foo: Loadable<Foo> = getFoo();

if (foo.loading) {
    // will infer to `Loading`
    console.log('Loading...');
} else if (foo.success) {
    // will infer to `Success<Foo>` and provide value object
    console.log(`Result: ${foo.value}`);
} else {
    // will infer to `Failed` and provide error object
    console.error(`Result: ${foo.error}`);
}
```

## Type-guards

To improve semantics and code readability, we provide the following type-guards:

* `isLoading()`
* `isSuccess()`
* `isFailed()`

```typescript
import { isLoading, isSuccess, Loadable } from 'loadable.ts';

const foo: Loadable<Foo> = getFoo();

if (isLoading(foo)) {
    // will infer to `Loading`
    console.log('Loading...');
} else if (isSuccess(foo)) {
    // will infer to `Success<Foo>` and provide value object
    console.log(`Result: ${foo.value}`);
} else {
    // will infer to `Failed` and provide error object
    console.error(`Result: ${foo.error}`);
}
```

## Usage with RxJS

We provide a `mapToLoadable()` operator for RxJS, which can be useful for async streams like HTTP responses.

* It prepends the upstream `Observable` with a `Loading` state
* It maps each result `T` in `Observable<T>` to a `Success<T>` state
* It catches and maps each error `E` in the `Observable` to a `Failed<E>` state

Example:

```typescript
function loadFoo(): Observable<Foo> {
  // ...
}

const foo$: Observable<Loadable<Foo>> = loadFoo().pipe(mapToLoadable());

// makes use of the provided type-guards
const showSpinner$ = foo$.pipe(map(isLoading));
const showError$ = foo$.pipe(map(isFailed));
const fooValue$ = foo$.pipe(filter(isSuccess), map(it => it.value));
```

Furthermore, we provide the following additional RxJS operators:

* `onFailed()`: shorthand for `filter(isFailed)` and `map((it) => it.error)`
* `onSuccess()`: shorthand for `filter(isSuccess)` and `map((it) => it.value)`
* `mapSuccess(mapFn)`: allows you to map the `value` when it is `Success`

## Structural directives for Angular

We also provide three useful structural directives for Angular.

They all accept a `Loadable<T>` or `Observable<Loadable<T>>` input variable.

* `*ifLoaded`: it will show the template when the latest value is in `Loading` state
* `*ifFailed`: it will show the template when the latest value is in `Failed` state
* `*ifSuccess`: it will show the template when the latest value is in `Success` state


Example usage:

```typescript
interface Foo {
    name: string;
}

@Component({
    /* ... */
})
class MyComponent{
    public foo$: Observable<Loadable<Foo>> = ...;
    
    /* ... */
}
```

```html
<!-- loading state -->
<div class="loading" *ifLoading="foo$"></div>

<!-- failed state -->
<div class="error" *ifFailed="foo$"></div>
<div class="error" *ifFailed="let error of foo$">
    {{ error }}
</div>

<!-- success state -->
<div class="result" *ifSuccess="foo$"></div>
<div class="result" *ifSuccess="let foo of foo$">
    {{ foo.name }}
</div>
```

## Monads

If you want to apply operations to a `Loadable`, without the need to unwrap it, you could use the `monad()` helper function.

It returns the monadic variant `LoadableMonad` which currently provides the following operations:

* `map(fn: (value: T) => R)`
* `flatMap(fn: (value: T) => Loadable<R>)` 

Example usage:

```typescript
interface Foo {
    loadableBar: Loadable<Bar>;
}

interface Bar {
    name: string;
}


const foo: Loadable<Foo> = ...;

const barName: Loadable<string> = monad(foo)
    .flatMap(foo => foo.loadableBar)
    .map(bar => bar.name);

// this would be the same as:
const barName = isSuccess(foo) ? isSuccess(foo.value.loadableBar) ? success(foo.value.loadableBar.value.name) : foo.value.loadableBar : foo

```

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/dirkluijk"><img src="https://avatars2.githubusercontent.com/u/2102973?v=4" width="100px;" alt="Dirk Luijk"/><br /><sub><b>Dirk Luijk</b></sub></a><br /><a href="https://github.com/dirkluijk/loadable-ts/commits?author=dirkluijk" title="Code">💻</a> <a href="https://github.com/dirkluijk/loadable-ts/commits?author=dirkluijk" title="Documentation">📖</a></td>
    <td align="center"><a href="https://craftsmen.nl/"><img src="https://avatars0.githubusercontent.com/u/16564855?v=4" width="100px;" alt="Daan Scheerens"/><br /><sub><b>Daan Scheerens</b></sub></a><br /><a href="#ideas-dscheerens" title="Ideas, Planning, & Feedback">🤔</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
