import { Observable, OperatorFunction } from 'rxjs';
import { map } from 'rxjs/operators';

import { Loadable } from '../loadable.model';
import { success } from '../factories';

export function mapSuccess<T, U>(mapFn: (value: T) => U): OperatorFunction<Loadable<T>, Loadable<U>> {
    return (source$: Observable<Loadable<T>>) => source$.pipe(
        map((it) => it.success ? success(mapFn(it.value)) : it)
    );
}
