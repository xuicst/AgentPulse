import { AgentEvent, AgentEventType } from "./events";

export class NotificationRouter {
    /**
     * 当前事件是否需要发送系统通知
     */
    public shouldNotify(event: AgentEvent): boolean {
        switch (event.type) {
            case AgentEventType.WaitingPermission:
            case AgentEventType.Finished:
            case AgentEventType.Error:
                return true;
            
            case AgentEventType.Started:
            case AgentEventType.ToolStarted:
            case AgentEventType.ToolFinished:
            case AgentEventType.Cancelled:
            default:
                return false;
        }
    }
}