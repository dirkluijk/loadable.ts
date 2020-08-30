import { monad } from './monad';
import { success } from './factories';

describe('monad', () => {
    it('should obey left identity monad law', () => {
        const value = 1;
        const loadable = monad(success(value));

        const f = (x: number) => success(x * 2);
        const g = (x: number) => x * 2;

        expect(loadable.flatMap(f)).toEqual(f(value));
        expect(loadable.map(g)).toEqual(success(g(value)));
    });

    it('should obey right identity monad law', () => {
        const loadable = monad(success(1));

        expect(loadable.flatMap(success)).toEqual(loadable);
    });

    it('should obey associativity monad law', () => {
        const loadable = monad(success(1));

        const f = (x: number) => monad(success(x * 2));
        const g = (x: number) => success(x + 6);

        expect(loadable.flatMap(f).flatMap(g)).toEqual(loadable.flatMap((it) => f(it).flatMap(g)));
    });
});
