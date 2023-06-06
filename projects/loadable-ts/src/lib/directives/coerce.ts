import { isObservable, Observable, of } from 'rxjs';

import { Loadable } from '../loadable.model';

export type LoadableDirectiveInput<T, E = unknown> = Loadable<T, E> | Observable<Loadable<T, E>>;

export function coerceInput<T, E>(loadable: LoadableDirectiveInput<T, E>): Observable<Loadable<T, E>> {
    return isObservable(loadable) ? loadable : of(loadable);
}
