import { Observable, OperatorFunction } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { Loadable } from '../loadable.model';
import { isSuccess } from '../type-guards';

export function onSuccess<T>(): OperatorFunction<Loadable<T>, T> {
    return (source$: Observable<Loadable<T>>) => source$.pipe(
        filter(isSuccess),
        map((it) => it.value),
    );
}
