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
    selector: '[ifSuccess]'
})
export class IfSuccessDirective<T> implements OnInit, OnDestroy {
    // alias
    @Input() public set ifSuccess(value: LoadableDirectiveInput<T>) {
        this.ifSuccessOf = value;
    }

    @Input() public ifSuccessOf?: LoadableDirectiveInput<T>;

    private readonly context: IfSuccessDirectiveContext<T> = new IfSuccessDirectiveContext<T>();
    private viewRef?: EmbeddedViewRef<IfSuccessDirectiveContext<T>>;

    private readonly subscriptions = new Subscription();

    constructor(
        private readonly changeDetector: ChangeDetectorRef,
        private readonly viewContainer: ViewContainerRef,
        private readonly templateRef: TemplateRef<IfSuccessDirectiveContext<T>>,
    ) {
    }

    public ngOnInit(): void {
        const loadable$ = observeProperty(this as IfSuccessDirective<T>, 'ifSuccessOf').pipe(
            switchMap((loadable) => coerceInput(loadable))
        );

        this.subscriptions.add(loadable$.subscribe((loadable) => {
            this.changeDetector.markForCheck();

            const loaded = loadable?.success ?? false;

            if (loadable && loadable.success) {
                this.context.$implicit = loadable.value;
            }

            if (loaded && !this.viewRef) {
                this.viewRef = this.viewContainer.createEmbeddedView(this.templateRef, this.context);
            }

            if (!loaded && this.viewRef) {
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
        context: unknown
    ): context is IfSuccessDirectiveContext<T> {
        return !!context;
    }
}

export class IfSuccessDirectiveContext<T> {
    public $implicit: T = null!;
}
