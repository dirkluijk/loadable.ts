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
    selector: '[ifLoading]'
})
export class IfLoadingDirective implements OnInit, OnDestroy {
    @Input() public ifLoading?: LoadableDirectiveInput<unknown>;

    private viewRef?: EmbeddedViewRef<void>;

    private readonly subscriptions = new Subscription();

    constructor(
        private readonly changeDetector: ChangeDetectorRef,
        private readonly viewContainer: ViewContainerRef,
        private readonly templateRef: TemplateRef<void>,
    ) {
    }

    public ngOnInit(): void {
        const loadable$ = observeProperty(this as IfLoadingDirective, 'ifLoading').pipe(
            switchMap((loadable) => coerceInput(loadable))
        );

        this.subscriptions.add(loadable$.subscribe((loadable) => {
            this.changeDetector.markForCheck();

            const loading = loadable?.loading ?? false;

            if (loading && !this.viewRef) {
                this.viewRef = this.viewContainer.createEmbeddedView(this.templateRef, undefined);
            }

            if (!loading && this.viewRef) {
                this.viewRef = undefined;
                this.viewContainer.clear();
            }
        }));

    }

    public ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }
}
