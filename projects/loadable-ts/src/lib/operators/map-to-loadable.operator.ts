import { concat, Observable, of, OperatorFunction } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { Loadable } from '../loadable.model';
import { LOADING, success, failed } from '../factories';

export function mapToLoadable<T, E = unknown>(): OperatorFunction<T, Loadable<T, E>> {
    return (source$: Observable<T>) => concat(
        of<Loadable<T, E>>(LOADING),
        source$.pipe(
            map((value) => success(value)),
            catchError((error: E) => of(failed(error))),
        ),
    );
}
