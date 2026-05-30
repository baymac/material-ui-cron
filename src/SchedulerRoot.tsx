import { Provider } from 'jotai';
import Scheduler from './Scheduler';
import type { SchedulerProps } from './types';

export default function SchedulerRoot(props: SchedulerProps) {
  // Each <Scheduler> gets its own jotai store. The atoms are module-level
  // singletons, so without a per-instance Provider two schedulers on the same
  // page would share (and stomp) each other's state. A Provider with no `store`
  // prop creates a fresh store on mount and tears it down on unmount — which
  // also removes the need to manually reset the atoms when the component leaves
  // the tree.
  return (
    <Provider>
      <Scheduler {...props} />
    </Provider>
  );
}
