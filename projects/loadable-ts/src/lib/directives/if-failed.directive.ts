import {
    ChangeDetectorRef,
    Directive,
    EmbeddedViewRef,
    Input,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewContainerRef
} from '@angular/core';
import { Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { observeProperty } from '../utils/observe-property';

import { coerceInput, LoadableDirectiveInput } from './coerce';

@Directive({
    selector: '[ifFailed]'
})
export class IfFailedDirective<E> implements OnInit, OnDestroy {
    // alias when not using the "let x of y" micro-syntax
    @Input() public set ifFailed(value: string | LoadableDirectiveInput<unknown, E>) {
        if (typeof value !== 'string') {
            this.ifFailedOf = value;
        }
    }

    @Input() public ifFailedOf?: LoadableDirectiveInput<unknown, E>;

    private readonly context: IfFailedDirectiveContext<E> = new IfFailedDirectiveContext<E>();
    private viewRef?: EmbeddedViewRef<IfFailedDirectiveContext<E>>;

    private readonly subscriptions = new Subscription();

    constructor(
        private readonly changeDetector: ChangeDetectorRef,
        private readonly viewContainer: ViewContainerRef,
        private readonly templateRef: TemplateRef<IfFailedDirectiveContext<E>>,
    ) {
    }

    public ngOnInit(): void {
        const loadable$ = observeProperty(this as IfFailedDirective<E>, 'ifFailedOf').pipe(
            switchMap((loadable) => coerceInput(loadable))
        );

        this.subscriptions.add(loadable$.subscribe((loadable) => {
            this.changeDetector.markForCheck();

            const failed = loadable?.failed ?? false;

            if (loadable && loadable.failed) {
                this.context.$implicit = loadable.error;
            }

            if (failed && !this.viewRef) {
                this.viewRef = this.viewContainer.createEmbeddedView(this.templateRef, this.context);
            }

            if (!failed && this.viewRef) {
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
        context: unknown
    ): context is IfFailedDirectiveContext<E> {
        return !!context;
    }
}

export class IfFailedDirectiveContext<E> {
    public $implicit: E = null!;
}
