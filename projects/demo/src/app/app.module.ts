import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
// tslint:disable-next-line:no-implicit-dependencies
import { IfFailedDirective, IfLoadingDirective, IfSuccessDirective } from 'loadable-ts';

import { AppComponent } from './app.component';

@NgModule({
    declarations: [
        AppComponent,
    ],
    imports: [
        BrowserAnimationsModule,
        IfFailedDirective,
        IfLoadingDirective,
        IfSuccessDirective,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
