import { Loadable, Loading, Success, Failed } from './loadable.model';

export function isLoading(loadable: Loadable<unknown>): loadable is Loading {
    return loadable.loading;
}

export function isSuccess<T>(loadable: Loadable<T>): loadable is Success<T> {
    return loadable.success;
}

export function isFailed<E>(loadable: Loadable<unknown, E>): loadable is Failed<E> {
    return loadable.failed;
}
