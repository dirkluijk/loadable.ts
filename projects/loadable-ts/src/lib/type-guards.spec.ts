import { isLoading, isSuccess } from './type-guards';
import { Loadable } from './loadable.model';

interface Foo {
    name: string;
}

describe('type-guards', () => {
    it('should compile', () => {
        // tslint:disable-next-line:no-object-literal-type-assertion
        const foo: Loadable<Foo> = {} as Loadable<Foo>;

        if (isLoading(foo)) {
            // will infer to `Loading`
        } else if (isSuccess(foo)) {
            // will infer to `Success<Foo>` and provide value object
            // tslint:disable-next-line:no-unused-expression
            `Result: ${foo.value}`;
        } else {
            // will infer to `Failed` and provide error object
            // tslint:disable-next-line:no-unused-expression
            `Result: ${foo.error}`;
        }
    });
});
