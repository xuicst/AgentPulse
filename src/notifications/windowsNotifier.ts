import notifier from "node-notifier";
import { AgentEvent, AgentEventType } from "../core/events";
import { INotifier } from "../types";

export class WindowsNotifier implements INotifier {
    public readonly id = "windows";
    public readonly displayName = "Windows Toast Notification";

    public async notify(event: AgentEvent): Promise<void> {
        const title = `AgentPulse · ${event.source}`;
        const message = this.getMessage(event);

        notifier.notify(
        {
            title,
            message,
            appID: "AgentPulse",
            sound: true,
            wait: false
        },
        (error, response) => {
            if (error) {
            console.error("Windows notify failed:", error);
            } else {
            console.log("Windows notify response:", response);
            }
        }
        );
    }

    private getMessage(event: AgentEvent): string {
        switch (event.type) {
            case AgentEventType.WaitingPermission:
                return "需要你的授权。";

            case AgentEventType.Finished:
                return "任务已完成。";

            case AgentEventType.Error:
                return "任务执行失败。";

            case AgentEventType.WaitingInput:
                return "等待你的输入。";

            case AgentEventType.Started:
                return "任务已开始。";

            default:
                return `事件：${event.type}`;
        }
    }
}