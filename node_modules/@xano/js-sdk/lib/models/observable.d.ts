import { Observer } from "./observer";
export declare class Observable<T> {
    private onObserverCountChange?;
    private lastState;
    private observers;
    constructor(onObserverCountChange?: CallableFunction | undefined);
    private notifyCountChange;
    addObserver(observer: Observer<T>, getLastState?: boolean): void;
    removeObserver(observer: Observer<T>): void;
    notify(params: T): void;
}
//# sourceMappingURL=observable.d.ts.map