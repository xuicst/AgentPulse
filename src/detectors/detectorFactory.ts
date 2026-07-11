import { ConfigManager } from "../core/config";
import { BaseDetector } from "./base/baseDetector";
import { CodexDetector } from "./codex/codexDetector";
import { ClaudeDetector } from "./claude/claudeDetector";
import {
    getClaudeSignalFilePath,
    getCodexSignalFilePath
} from "../hooks/signalPaths";

export class DetectorFactory {
    public static create(
        config: ConfigManager
    ): BaseDetector[] {
        const detectors: BaseDetector[] = [];

        if (config.isCodexEnabled()) {
            detectors.push(
                new CodexDetector(
                    getCodexSignalFilePath()
                )
            );
        }

        if (config.isClaudeEnabled()) {
            detectors.push(
                new ClaudeDetector(
                    getClaudeSignalFilePath()
                )
            );
        }

        return detectors;
    }
}