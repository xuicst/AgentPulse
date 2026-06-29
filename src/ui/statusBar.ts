import * as vscode from "vscode";

export enum AgentPulseStatus {
    Idle = "idle",
    Running = "running",
    WaitingPermission = "waitingPermission",
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

    public dispose(): void {
        this.item.dispose();
    }
}