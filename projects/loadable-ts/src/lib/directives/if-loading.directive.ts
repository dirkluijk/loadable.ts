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
    selector: '[ifLoading]',
})
export class IfLoadingDirective implements OnInit, OnDestroy {
    @Input() public ifLoading?: LoadableDirectiveInput<unknown> | null;

    private viewRef?: EmbeddedViewRef<void>;

    private readonly subscriptions = new Subscription();

    constructor(
        private readonly changeDetector: ChangeDetectorRef,
        private readonly viewContainer: ViewContainerRef,
        private readonly templateRef: TemplateRef<void>,
    ) {
    }

    public ngOnInit(): void {
        const loadableChanged$ = observeProperty(this as IfLoadingDirective, 'ifLoading');
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
