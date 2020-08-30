export type Loadable<T, E = unknown> = Loading | Failed<E> | Success<T>;

export interface Loading {
    readonly loading: true;
    readonly failed: false;
    readonly success: false;
}

export interface Failed<E> {
    readonly loading: false;
    readonly failed: true;
    readonly success: false;
    readonly error: E;
}

export interface Success<T> {
    readonly loading: false;
    readonly failed: false;
    readonly success: true;
    readonly value: T;
}
