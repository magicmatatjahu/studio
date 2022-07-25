import { useContext } from "react";

import { StudioContext } from '../contexts/studio.context';

export function useStudio() {
  return useContext(StudioContext);
}
