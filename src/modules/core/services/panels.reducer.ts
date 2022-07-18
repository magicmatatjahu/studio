import { Injectable, SingletonScope } from "@adi/core";
import { StateReducer } from "../../state/state.interfaces";

import type { AnyAction } from "redux";

@Injectable({
  scope: SingletonScope,
})
export class PanelsReducer implements StateReducer {
  public id = 'studio:state:panels';

  private _initialState: any;

  initialState() {
    return this._initialState = {
      'studio:panels:active-panel': 0,
      'studio:panels:active-tab': 0,
    }
  }

  reducer(state = this._initialState, action: AnyAction) {
    switch(action.type) {
      case 'studio:panels:active-panel': {
        return {
          ...state,
          'studio:panels:active-panel': action.payload,
        }
      } 
      case 'studio:panels:active-tab': {
        return {
          ...state,
          'studio:panels:active-tab': action.payload,
        }
      }
    }
    return state;
  }
}
