import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable, MonoTypeOperatorFunction, ReplaySubject } from 'rxjs';
import { share } from 'rxjs/operators';
// tslint:disable-next-line:no-implicit-dependencies
import { Loadable, loading, mapToLoadable, failed, success } from 'loadable-ts';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
    public foo$: Observable<Loadable<Foo, FooError>> = delayedWithPossibleFailure().pipe(
        mapToLoadable(),
        cache(),
    );

    public loading: Loadable<Foo, FooError> = loading();
    public error: Loadable<Foo, FooError> = failed(new FooError('Error!'));
    public success: Loadable<Foo, FooError> = success({ bar: 'Foo!' });
}

interface Foo {
    bar: string;
}

class FooError extends Error {
    constructor(message: string) {
        super(message);
    }
}

function delayedWithPossibleFailure(): Observable<Foo> {
    return new Observable((subscriber) => {
        const timeoutId = setTimeout(() => {
            if (Math.random() < 0.5) {
                subscriber.next({ bar: 'Bar!' });
                subscriber.complete();
            } else {
                subscriber.error(new FooError('Error!'));
            }
        }, 2500);

        return () => clearTimeout(timeoutId);
    });
}

function cache<T>(): MonoTypeOperatorFunction<T> {
    return (source$: Observable<T>) => source$.pipe(
        share({
            connector: () => new ReplaySubject(1),
            resetOnError: false,
            resetOnComplete: false,
            resetOnRefCountZero: false,
        }),
    );
}
