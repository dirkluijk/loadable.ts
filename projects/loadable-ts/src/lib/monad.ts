import { Loadable, Loading, Failed, Success } from './loadable.model';
import { isSuccess, isLoading } from './type-guards';

abstract class AbstractLoadableMonad<T, E> {
    public abstract readonly loading: boolean;
    public abstract readonly success: boolean;
    public abstract readonly failed: boolean;

    public map<R>(mappingFn: (value: T) => R): LoadableMonad<R, E> {
        if (this.isSuccess()) {
            return new SuccessMonad(mappingFn(this.value));
        }

        if (this.isFailed()) {
            return new FailedMonad(this.error);
        }

        if (this.isLoading()) {
            return new LoadingMonad();
        }

        throw Error('Unexpected error');
    }

    public flatMap<R, RE>(mappingFn: (value: T) => Loadable<R, RE>): LoadableMonad<R, RE | E> {
        if (this.isSuccess()) {
            return monad(mappingFn(this.value));
        }

        if (this.isFailed()) {
            return new FailedMonad(this.error);
        }

        if (this.isLoading()) {
            return new LoadingMonad();
        }

        throw Error('Unexpected error');
    }

    protected isLoading(): this is LoadingMonad<T, E> {
        return this.loading;
    }

    protected isSuccess(): this is SuccessMonad<T, E> {
        return this.success;
    }

    protected isFailed(): this is FailedMonad<T, E> {
        return this.failed;
    }

    public static create<T, E>(loadable: Loadable<T, E>): LoadableMonad<T, E> {
        if (isLoading(loadable)) {
            return new LoadingMonad();
        }

        if (isSuccess(loadable)) {
            return new SuccessMonad(loadable.value);
        }

        return new FailedMonad(loadable.error);
    }
}

class LoadingMonad<T, E> extends AbstractLoadableMonad<T, E> implements Loading {
    public readonly loading = true;
    public readonly success = false;
    public readonly failed = false;
}

class FailedMonad<T, E> extends AbstractLoadableMonad<T, E> implements Failed<E> {
    public readonly loading = false;
    public readonly success = false;
    public readonly failed = true;

    constructor(public error: E) {
        super();
    }
}

class SuccessMonad<T, E> extends AbstractLoadableMonad<T, E> implements Success<T> {
    public readonly loading = false;
    public readonly success = true;
    public readonly failed = false;

    constructor(public value: T) {
        super();
    }
}

type LoadableMonad<T, E> = LoadingMonad<T, E> | FailedMonad<T, E> | SuccessMonad<T, E>;

export function monad<T, E>(loadable: Loadable<T, E>): LoadableMonad<T, E> {
    return AbstractLoadableMonad.create(loadable);
}
