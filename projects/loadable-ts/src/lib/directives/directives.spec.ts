import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { createComponentFactory } from '@ngneat/spectator/jest';

import { Loadable, LOADING, failed, success, IfLoadingDirective, IfSuccessDirective, IfFailedDirective } from '../../public-api';

interface Foo {
    bar: string;
}

interface FooError {
    message: string;
}

// tslint:disable-next-line:use-component-selector
@Component({
    template: `
        <div class="loading" *ifLoading="foo$"></div>
        <div class="loading" *ifLoading="foo$ | async"></div>
        <div class="loading" *ifLoading="foo"></div>

        <div class="failed" *ifFailed="foo$"></div>
        <div class="failed" *ifFailed="foo$ | async"></div>
        <div class="failed with-error-message" *ifFailed="let error of foo$ | async">{{ error.message }}</div>
        <div class="failed" *ifFailed="foo"></div>
        <div class="failed with-error-message" *ifFailed="let error of foo">{{ error.message }}</div>

        <div class="success" *ifSuccess="foo$"></div>
        <div class="success" *ifSuccess="foo$ | async"></div>
        <div class="success with-value" *ifSuccess="let value of foo$">{{ value.bar }}</div>
        <div class="success with-value" *ifSuccess="let value of foo$ | async">{{ value.bar }}</div>
        <div class="success" *ifSuccess="foo"></div>
        <div class="success with-value" *ifSuccess="let value of foo">{{ value.bar }}</div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
class DummyComponent {
    public fooSubject = new BehaviorSubject<Loadable<Foo, FooError>>(LOADING);
    public foo$: Observable<Loadable<Foo, FooError>> = this.fooSubject.asObservable();

    public foo: Loadable<Foo, FooError> = LOADING;
}

describe('directives', () => {
    const createComponent = createComponentFactory({
        component: DummyComponent,
        imports: [IfLoadingDirective, IfSuccessDirective, IfFailedDirective],
    });

    it('should compile', () => {
        const spectator = createComponent();

        expect('.loading').toHaveLength(3);
        expect('.failed').toHaveLength(0);
        expect('.success').toHaveLength(0);

        // failed
        const error = {message: 'Failed!'};

        spectator.component.fooSubject.next(failed(error));
        spectator.component.foo = failed(error);
        spectator.detectChanges();

        expect('.loading').toHaveLength(0);
        expect('.failed').toHaveLength(5);
        expect('.success').toHaveLength(0);

        expect('.failed.with-error-message').toHaveLength(2);
        const errorElements = spectator.queryAll('.failed.with-error-message');

        expect(errorElements).toHaveLength(2);
        errorElements.every((el) => expect(el).toHaveExactText('Failed!'));

        // success
        const result = {bar: 'Bar!'};

        spectator.component.fooSubject.next(success(result));
        spectator.component.foo = success(result);
        spectator.detectChanges();

        expect('.loading').toHaveLength(0);
        expect('.failed').toHaveLength(0);
        expect('.success').toHaveLength(6);

        const valueElements = spectator.queryAll('.success.with-value');

        expect(valueElements).toHaveLength(3);
        valueElements.every((el) => expect(el).toHaveExactText('Bar!'));
    });
});
