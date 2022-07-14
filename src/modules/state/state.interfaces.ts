import type { AnyAction } from "redux";

export interface StateReducer {
  id: string;
  initialState(): any; 
  reducer(state: any, action: AnyAction): any; 
}