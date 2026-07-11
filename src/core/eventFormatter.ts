import { AgentEvent, AgentEventType } from "./events";

export interface FormattedEvent {
    title: string;
    message: string;
    icon?: string;
}

export class EventFormatter {
    public static format(event: AgentEvent): FormattedEvent {
        const agent =
            event.agent ??
            event.source ??
            "Agent";

        switch (event.type) {
            case AgentEventType.Started:
                return {
                    title: `${agent}`,
                    message: "开始工作"
                };

            case AgentEventType.ToolStarted:
                return {
                    title: `${agent}`,
                    message: `开始执行 ${event.toolName ?? "Tool"}`
                };

            case AgentEventType.ToolFinished:
                return {
                    title: `${agent}`,
                    message: `完成 ${event.toolName ?? "Tool"}`
                };

            case AgentEventType.WaitingPermission:
                return {
                    title: `${agent}`,
                    message: "等待授权"
                };

            case AgentEventType.Finished:
                return {
                    title: `${agent}`,
                    message: "任务完成"
                };

            case AgentEventType.Cancelled:
                return {
                    title: `${agent}`,
                    message: "任务已取消"
                };

            case AgentEventType.Error:
                return {
                    title: `${agent}`,
                    message: "发生错误"
                };

            default:
                return {
                    title: `${agent}`,
                    message: event.type
                };
        }
    }
}