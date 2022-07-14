import { Injectable, Inject, SingletonScope } from "@adi/core";
import { configureStore } from "@reduxjs/toolkit";

import { ReducerManagerService } from "./reducer-manager.service";

import type { OnInit } from '@adi/core';
import type { StateReducer } from './state.interfaces';

@Injectable({
  scope: SingletonScope,
})
export class StateService implements OnInit {
  private store!: ReturnType<typeof this.createStore>;

  constructor(
    @Inject('studio:state:reducer') public reducers: Array<StateReducer>,
    private reducerManager: ReducerManagerService,
  ) {}

  onInit(): void | Promise<void> {
    this.store = this.createStore();
  }

  getStore() {
    return this.store;
  };

  dispatch<T>(type: string, payload: T) {
    return this.store.dispatch({ type, payload });
  }

  subscribe(listener: () => void) {
    return this.store.subscribe(listener);
  };

  private createStore() {
    const preloadedState = this.serializeInitialState();
    const reducers = this.serializeReducers();
    this.reducerManager.addMany(reducers);
    
    return configureStore({
      reducer: this.reducerManager.reduce.bind(this.reducerManager),
      preloadedState,
    });
  }

  private serializeReducers(): Record<string, (state: any, action: any) => any> {
    return this.reducers.reduce((all, current) => {
      all[current.id] = current.reducer.bind(current);
      return all;
    }, {} as Record<string, (state: any, action: any) => any>);
  }

  private serializeInitialState(): Record<string, any> {
    return this.reducers.reduce((all, current) => {
      all[current.id] = current.initialState();
      return all;
    }, {} as Record<string, any>);
  }
}
