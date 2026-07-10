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
import { SignalWatcher } from "../hooks/signalWatcher";
import { getClaudeSignalFilePath } from "../hooks/signalPaths";
import { WindowsNotifier } from "../notifications/windowsNotifier";
import { AgentPulseStatus } from "../ui/statusBar";
import { registerWindowsAumid } from "../notifications/windowsAumid";
import { CodexDetector } from "../detectors/codex/codexDetector";
import { getCodexSignalFilePath } from "../hooks/signalPaths";

export class Lifecycle {
    private readonly disposables: vscode.Disposable[] = [];
    private readonly logger = Logger.getInstance();
    private readonly config = new ConfigManager();
    private statusBar?: StatusBarManager;
    private readonly eventBus = EventBus.getInstance();
    private readonly detectorManager = new DetectorManager();
    private readonly notifierManager = new NotifierManager();
    private signalWatcher?: SignalWatcher;

    public async initialize(context: vscode.ExtensionContext): Promise<void> {
        if (!this.config.isEnabled()) {
            this.logger.info("AgentPulse is disabled.");
            return;
        }
        this.logger.info("AgentPulse initializing...");
        await registerWindowsAumid();
        this.logger.info("Windows AUMID registered.");
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
            vscode.commands.registerCommand("agentPulse.testNotification", async () => {
                this.logger.info("Test notification requested.");

                this.eventBus.publish({
                    source: "test",
                    type: AgentEventType.WaitingPermission,
                    timestamp: Date.now()
                });
            })
        );

        this.notifierManager.register(new MockNotifier());
        this.notifierManager.register(
            new WindowsNotifier(context.extensionPath)
        );

        // this.eventBus.subscribe(async (event) => {
        //     this.logger.info(`[${event.source}] ${event.type}`);
        //     await this.notifierManager.notifyAll(event);
        // });

        this.eventBus.subscribe(async (event) => {

            this.logger.info(
                `[${event.source}] ${event.type}`
            );

            switch (event.type) {

                case AgentEventType.WaitingPermission:
                    this.statusBar?.setStatus(
                        AgentPulseStatus.WaitingPermission
                    );
                    break;

                case AgentEventType.Finished:
                    this.statusBar?.setStatus(
                        AgentPulseStatus.Idle
                    );
                    break;

                case AgentEventType.Error:
                    this.statusBar?.setStatus(
                        AgentPulseStatus.Error
                    );
                    break;
            }

            await this.notifierManager.notifyAll(event);

        });

        // this.detectorManager.register(new MockDetector());
        this.detectorManager.register(
            new CodexDetector(getCodexSignalFilePath())
        );
        await this.detectorManager.activateAll();

        context.subscriptions.push(...this.disposables);
        
        this.logger.info("AgentPulse initialized.");
        
        this.eventBus.publish({
            source: "system",
            type: AgentEventType.Started,
            timestamp: Date.now()
        });

        // this.signalWatcher = new SignalWatcher(
        //     getClaudeSignalFilePath(),
        //     () => {
        //         this.logger.info("Claude signal file changed.");
        //     }
        // );

        // this.signalWatcher.start();
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
        this.signalWatcher?.stop();
    }
}