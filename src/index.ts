import SchedulerRoot from './SchedulerRoot'

export * from './types'

// Support "import { Scheduler } from 'material-ui-cron'"
// Support "import { Scheduler as MaterialUICron } from 'material-ui-cron'"
export { SchedulerRoot }

// Support "import Scheduler from 'material-ui-cron'"
export default SchedulerRoot
