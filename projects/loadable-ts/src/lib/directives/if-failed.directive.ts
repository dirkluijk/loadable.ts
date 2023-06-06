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
    selector: '[ifFailed]',
})
export class IfFailedDirective<E> implements OnInit, OnDestroy {
    // alias when not using the "let x of y" micro-syntax
    @Input() public set ifFailed(value: string | LoadableDirectiveInput<unknown, E> | null) {
        if (typeof value !== 'string') {
            this.ifFailedOf = value ?? undefined;
        }
    }

    @Input() public ifFailedOf?: LoadableDirectiveInput<unknown, E> | null;

    private viewRef?: EmbeddedViewRef<IfFailedDirectiveContext<E>>;

    private readonly subscriptions = new Subscription();

    constructor(
        private readonly changeDetector: ChangeDetectorRef,
        private readonly viewContainer: ViewContainerRef,
        private readonly templateRef: TemplateRef<IfFailedDirectiveContext<E>>,
    ) {
    }

    public ngOnInit(): void {
        const loadableChanged$ = observeProperty(this as IfFailedDirective<E>, 'ifFailedOf');
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

            if (loadable.failed && this.viewRef) {
                this.viewRef.context.$implicit = loadable.error;
            } else if (loadable.failed && !this.viewRef) {
                this.viewRef = this.viewContainer.createEmbeddedView(this.templateRef, { $implicit: loadable.error });
            } else if (!loadable.failed && this.viewRef) {
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
    public static ngTemplateContextGuard<E>(
        _directive: IfFailedDirective<E>, // tslint:disable-line:variable-name
        context: unknown,
    ): context is IfFailedDirectiveContext<E> {
        return !!context;
    }
}

export interface IfFailedDirectiveContext<E> {
    $implicit: E;
}
