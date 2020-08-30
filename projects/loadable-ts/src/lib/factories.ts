import { Loading, Success, Failed } from './loadable.model';

export const LOADING: Loading = {loading: true, failed: false, success: false};

export function loading(): Loading {
    return LOADING;
}

export function success<T>(value: T): Success<T> {
    return {loading: false, failed: false, success: true, value};
}

export function failed<E>(error: E): Failed<E> {
    return {loading: false, failed: true, success: false, error};
}
