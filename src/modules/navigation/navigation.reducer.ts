import { Inject, Injectable, SingletonScope } from "@adi/core";
import { StateReducer } from "../state/state.interfaces";

import type { AnyAction } from "redux";
import type { ActivityBar as ActivityBarNamespace } from '../../modules/core/interfaces';

@Injectable({
  scope: SingletonScope,
})
export class NavigationReducer implements StateReducer {
  public id = 'studio:state:navigation';

  private _initialState: any;

  constructor(
    @Inject('studio:activity-bar:element') public activityBarElements: Array<ActivityBarNamespace.Element>,
  ) {}

  initialState() {
    return this._initialState = {
      'studio:activity-bar:active': this.activityBarElements[0].id,
    }
  }

  reducer(state = this._initialState, action: AnyAction) {
    switch(action.type) {
      case 'studio:activity-bar:active': {
        return {
          ...state,
          'studio:activity-bar:active': action.payload,
        }
      } 
    }
    return state;
  }
}
