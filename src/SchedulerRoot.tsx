// Removed RecoilRoot; Jotai does not require a provider
import Scheduler from './Scheduler';
import type { SchedulerProps } from './types';

export default function SchedulerRoot(props: SchedulerProps) {
  return <Scheduler {...props} />;
}
