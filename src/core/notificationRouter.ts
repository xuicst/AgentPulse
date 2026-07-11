import { ConfigManager } from "./config";
import { AgentEvent, AgentEventType } from "./events";

export class NotificationRouter {
    public constructor(
        private readonly config: ConfigManager
    ) {}

    public shouldNotify(event: AgentEvent): boolean {
        if (!this.config.isDesktopNotificationEnabled()) {
            return false;
        }
    
        switch (event.type) {
    
            case AgentEventType.WaitingPermission:
                return this.config.isPermissionNotificationEnabled();
    
            case AgentEventType.Finished:
                return this.config.isCompletedNotificationEnabled();
    
            case AgentEventType.Error:
                return this.config.isErrorNotificationEnabled();
    
            case AgentEventType.Cancelled:
                return this.config.isCancelledNotificationEnabled();
    
            default:
                return false;
        }
    }
}