import { Observable, OperatorFunction } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { Loadable } from '../loadable.model';
import { isFailed } from '../type-guards';

export function onFailed<T, E>(): OperatorFunction<Loadable<T, E>, E> {
    return (source$: Observable<Loadable<T, E>>) => source$.pipe(
        filter(isFailed),
        map((it) => it.error),
    );
}
