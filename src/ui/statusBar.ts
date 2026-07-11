import * as vscode from "vscode";
import { AgentEvent, AgentEventType } from "../core/events";

export enum AgentPulseStatus {
    Idle = "idle",
    Running = "running",
    WaitingPermission = "waitingPermission",
    WaitingInput = "waitingInput",
    Error = "error"
}

export class StatusBarManager {
    private readonly item: vscode.StatusBarItem;

    constructor() {
        this.item = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );

        this.item.command = "agentPulse.showOutput";
        this.setStatus(AgentPulseStatus.Idle);
        this.item.show();
    }

    public setStatus(status: AgentPulseStatus): void {
        switch (status) {
            case AgentPulseStatus.Running:
                this.item.text = "$(sync~spin) AgentPulse";
                this.item.tooltip = "AgentPulse is running";
                break;
            case AgentPulseStatus.WaitingPermission:
                this.item.text = "$(warning) AgentPulse";
                this.item.tooltip = "AgentPulse is waiting for permission";
                break;
            case AgentPulseStatus.WaitingInput:
                this.item.text = "$(edit) AgentPulse";
                this.item.tooltip = "AgentPulse is waiting for input";
                break;
            case AgentPulseStatus.Error:
                this.item.text = "$(error) AgentPulse";
                this.item.tooltip = "AgentPulse error";
                break;
            case AgentPulseStatus.Idle:
            default:
                this.item.text = "$(zap) AgentPulse";
                this.item.tooltip = "AgentPulse is ready";
                break;
        }
    }

    public updateByEvent(event: AgentEvent): void {
        switch (event.type) {
            case AgentEventType.WaitingPermission:
                this.setStatus(AgentPulseStatus.WaitingPermission);
                break;

            case AgentEventType.WaitingInput:
                this.setStatus(AgentPulseStatus.WaitingInput);
                break;
            
            case AgentEventType.Finished:
                this.setStatus(AgentPulseStatus.Idle);
                break;

            case AgentEventType.Error:
                this.setStatus(AgentPulseStatus.Error);
                break;

            default:
                this.setStatus(AgentPulseStatus.Running);
                break;
        }
    }

    public dispose(): void {
        this.item.dispose();
    }
}