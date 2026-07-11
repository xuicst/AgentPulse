import * as fs from "fs";
import * as path from "path";
import { Logger } from "../core/logger";

export class SignalWatcher {
    private readonly logger = Logger.getInstance();

    private watcher?: fs.FSWatcher;
    private debounceTimer?: NodeJS.Timeout;

    constructor(
        private readonly filePath: string,
        private readonly onChanged: () => void
    ) {}

    public start(): void {
        if (this.watcher) {
            return;
        }

        if (!fs.existsSync(this.filePath)) {
            this.logger.debug(
                `Signal file not found: ${this.filePath}`
            );
            return;
        }

        this.logger.info(
            `Watching signal: ${this.filePath}`
        );

        const dir = path.dirname(this.filePath);
        const filename = path.basename(this.filePath);

        this.watcher = fs.watch(
            dir,
            (_eventType, changedFile) => {
                if (changedFile !== filename) {
                    return;
                }

                this.scheduleCallback();
            }
        );
    }

    private scheduleCallback(): void {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        this.debounceTimer = setTimeout(() => {
            this.debounceTimer = undefined;
            this.onChanged();
        }, 50);
    }

    public stop(): void {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = undefined;
        }

        this.watcher?.close();
        this.watcher = undefined;

        this.logger.info("Signal watcher stopped.");
    }
}