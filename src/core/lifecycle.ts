import * as vscode from "vscode";
import { Logger } from "./logger";
import { ConfigManager } from "./config";
import { StatusBarManager } from "../ui/statusBar";
import { EventBus } from "./eventBus";
import { AgentEventType } from "./events";

export class Lifecycle {
    private readonly disposables: vscode.Disposable[] = [];
    private readonly logger = Logger.getInstance();
    private readonly config = new ConfigManager();
    private statusBar?: StatusBarManager;
    private readonly eventBus = EventBus.getInstance();

    public async initialize(context: vscode.ExtensionContext): Promise<void> {
        if (!this.config.isEnabled()) {
            this.logger.info("AgentPulse is disabled.");
            return;
        }
        this.logger.info("AgentPulse initializing...");
        if (this.config.isStatusBarEnabled()) {
            this.statusBar = new StatusBarManager();
            this.disposables.push(this.statusBar);
        }
        this.disposables.push(
            vscode.commands.registerCommand("agentPulse.showOutput", () => {
                this.logger.show();
            })
        );
        this.disposables.push(
            vscode.commands.registerCommand("agentPulse.restart", async () => {
                this.logger.info("AgentPulse restart requested.");
                vscode.window.showInformationMessage("AgentPulse restarted.");
            })
        );
        this.disposables.push(
            vscode.commands.registerCommand("agentPulse.about", () => {
                vscode.window.showInformationMessage(
                    "AgentPulse v0.1.0 - AI Agent Notification Framework"
                );
            })
        );

        this.eventBus.subscribe((event) => {
            this.logger.info(`[${event.source}] ${event.type}`);
        });

        context.subscriptions.push(...this.disposables);
        this.logger.info("AgentPulse initialized.");
    }

    public dispose(): void {
        this.logger.info("AgentPulse disposing...");
        for (const disposable of this.disposables) {
            disposable.dispose();
        }
        this.logger.dispose();
    }
}