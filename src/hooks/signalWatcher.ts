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

        const dir = path.dirname(this.filePath);
        const filename = path.basename(this.filePath);

        try {
            fs.mkdirSync(dir, { recursive: true });

            this.watcher = fs.watch(
                dir,
                (_eventType, changedFile) => {
                    if (changedFile?.toString() !== filename) {
                        return;
                    }

                    this.scheduleCallback();
                }
            );

            this.logger.info(
                `Watching signal directory: ${dir}`
            );
        } catch (error) {
            this.logger.error(
                `Failed to watch signal directory ${dir}: ${String(error)}`
            );
        }
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
