import {
    ChangeDetectorRef,
    Directive,
    EmbeddedViewRef,
    Input,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewContainerRef,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { switchMap, filter } from 'rxjs/operators';

import { observeProperty } from '../utils/observe-property';
import { isNotNullOrUndefined } from '../utils/is-not-null-or-undefined';

import { coerceInput, LoadableDirectiveInput } from './coerce';

@Directive({
    standalone: true,
    selector: '[ifSuccess]',
})
export class IfSuccessDirective<T> implements OnInit, OnDestroy {
    // alias when not using the "let x of y" micro-syntax
    @Input() public set ifSuccess(value: string | LoadableDirectiveInput<T> | null) {
        if (typeof value !== 'string') {
            this.ifSuccessOf = value ?? undefined;
        }
    }

    @Input() public ifSuccessOf?: LoadableDirectiveInput<T> | null;

    private viewRef?: EmbeddedViewRef<IfSuccessDirectiveContext<T>>;

    private readonly subscriptions = new Subscription();

    constructor(
        private readonly changeDetector: ChangeDetectorRef,
        private readonly viewContainer: ViewContainerRef,
        private readonly templateRef: TemplateRef<IfSuccessDirectiveContext<T>>,
    ) {
    }

    public ngOnInit(): void {
        const loadableChanged$ = observeProperty(this as IfSuccessDirective<T>, 'ifSuccessOf');
        const loadable$ = loadableChanged$.pipe(
            filter(isNotNullOrUndefined),
            switchMap((loadable) => coerceInput(loadable)),
        );

        // remove view whenever input changes, because new Observable can be empty.
        this.subscriptions.add(loadableChanged$.subscribe(() => {
            this.viewRef = undefined;
            this.viewContainer.clear();
        }));

        this.subscriptions.add(loadable$.subscribe((loadable) => {
            this.changeDetector.markForCheck();

            if (loadable.success && this.viewRef) {
                this.viewRef.context.$implicit = loadable.value;
            } else if (loadable.success && !this.viewRef) {
                this.viewRef = this.viewContainer.createEmbeddedView(this.templateRef, { $implicit: loadable.value });
            } else if (!loadable.success && this.viewRef) {
                this.viewRef = undefined;
                this.viewContainer.clear();
            }
        }));

    }

    public ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    // Needed for the Ivy template type-check compiler, see:
    // https://angular.io/guide/structural-directives#improving-template-type-checking-for-custom-directives
    public static ngTemplateContextGuard<T>(
        _directive: IfSuccessDirective<T>, // tslint:disable-line:variable-name
        context: unknown,
    ): context is IfSuccessDirectiveContext<T> {
        return !!context;
    }
}

export interface IfSuccessDirectiveContext<T> {
    $implicit: T;
}
