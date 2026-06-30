import * as vscode from "vscode";
import { Logger } from "./logger";
import { ConfigManager } from "./config";
import { StatusBarManager } from "../ui/statusBar";
import { EventBus } from "./eventBus";
import { AgentEventType } from "./events";
import { DetectorManager } from "../detectors/detectorManager";
import { MockDetector } from "../detectors/mockDetector";
import { NotifierManager } from "../notifications/notifierManager";
import { MockNotifier } from "../notifications/mockNotifier";

export class Lifecycle {
    private readonly disposables: vscode.Disposable[] = [];
    private readonly logger = Logger.getInstance();
    private readonly config = new ConfigManager();
    private statusBar?: StatusBarManager;
    private readonly eventBus = EventBus.getInstance();
    private readonly detectorManager = new DetectorManager();
    private readonly notifierManager = new NotifierManager();

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

        this.notifierManager.register(new MockNotifier());

        this.eventBus.subscribe(async (event) => {
            this.logger.info(`[${event.source}] ${event.type}`);
            await this.notifierManager.notifyAll(event);
        });

        this.detectorManager.register(new MockDetector());
        await this.detectorManager.activateAll();

        context.subscriptions.push(...this.disposables);
        
        this.logger.info("AgentPulse initialized.");
        
        this.eventBus.publish({
            source: "system",
            type: AgentEventType.Started,
            timestamp: Date.now()
        });
    }

    public async dispose(): Promise<void> {
        this.logger.info("AgentPulse disposing...");
        await this.detectorManager.deactivateAll();
        this.notifierManager.dispose();
        for (const disposable of this.disposables) {
            disposable.dispose();
        }
        this.eventBus.dispose();
        this.logger.dispose();
    }
}