import { NgModule } from '@angular/core';

import { IfFailedDirective } from './if-failed.directive';
import { IfSuccessDirective } from './if-success.directive';
import { IfLoadingDirective } from './if-loading.directive';

@NgModule({
    declarations: [
        IfSuccessDirective,
        IfLoadingDirective,
        IfFailedDirective
    ],
    exports: [
        IfSuccessDirective,
        IfLoadingDirective,
        IfFailedDirective
    ]
})
export class LoadableDirectivesModule {}
