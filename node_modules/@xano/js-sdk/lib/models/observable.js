"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Observable = void 0;
var Observable = /** @class */ (function () {
    function Observable(onObserverCountChange) {
        this.onObserverCountChange = onObserverCountChange;
        this.observers = [];
    }
    Observable.prototype.notifyCountChange = function () {
        if (typeof this.onObserverCountChange === "function") {
            this.onObserverCountChange(this.observers.length);
        }
    };
    Observable.prototype.addObserver = function (observer, getLastState) {
        if (getLastState === void 0) { getLastState = false; }
        this.observers.push(observer);
        if (getLastState && this.lastState) {
            observer.update(this.lastState);
        }
        this.notifyCountChange();
    };
    Observable.prototype.removeObserver = function (observer) {
        var removeIndex = this.observers.findIndex(function (obs) { return observer === obs; });
        if (removeIndex !== -1) {
            this.observers.splice(removeIndex, 1);
        }
        this.notifyCountChange();
    };
    Observable.prototype.notify = function (params) {
        this.lastState = params;
        for (var _i = 0, _a = this.observers; _i < _a.length; _i++) {
            var observer = _a[_i];
            observer.update(params);
        }
    };
    return Observable;
}());
exports.Observable = Observable;
//# sourceMappingURL=observable.js.map