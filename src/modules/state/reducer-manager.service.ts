import { Injectable, SingletonScope } from "@adi/core";
import { combineReducers } from "@reduxjs/toolkit";

@Injectable({
  scope: SingletonScope,
})
export class ReducerManagerService {
  private reducersToRemove: string[] = [];
  private _reducers: Record<string, any> = {};
  private combinedReducer: any;

  get reducers() {
    return this._reducers;
  }

  reduce(state: any, action: any) {
    if (this.reducersToRemove.length > 0) {
      state = { ...state };
      for (let key of this.reducersToRemove) {
        delete state[key];
      }
      this.reducersToRemove.length = 0;
    }

    return this.combinedReducer(state, action);
  }

  add(key: string, reducer: any) {
    if (!key || this.reducers[key]) {
      return;
    }
    this.reducers[key] = reducer;
    this.combinedReducer = combineReducers(this.reducers);
  }

  addMany(reducers: Record<string, any>) {
    for (let key in reducers) {
      if (!key || this.reducers[key]) {
        continue;
      }
      this.reducers[key] = reducers[key];
    }
    this.combinedReducer = combineReducers(this.reducers);
  }

  remove(key: string) {
    if (!key || !this.reducers[key]) {
      return;
    }
    delete this.reducers[key];
    this.reducersToRemove.push(key);
    this.combinedReducer = combineReducers(this.reducers);
  }
}
