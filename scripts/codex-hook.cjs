const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");

const baseDir = path.join(os.homedir(), ".agentpulse");
const signalDir = path.join(baseDir, "signals");
const logPath = path.join(baseDir, "codex-hook.log");

fs.mkdirSync(signalDir, { recursive: true });

let input = "";
process.stdin.setEncoding("utf8");

process.stdin.on("data", chunk => {
    input += chunk;
});

process.stdin.on("end", () => {
    try {
        fs.appendFileSync(
            logPath,
            `[${new Date().toISOString()}] stdin: ${input}\n`,
            "utf8"
        );

        const payload = input.trim() ? JSON.parse(input) : {};

        const eventName =
            payload.hook_event_name ??
            payload.hookEventName ??
            "Unknown";

        const signal = {
            id: crypto.randomUUID(),
            agent: "codex",
            event: eventName,
            createdAt: Date.now(),
            payload
        };

        const signalPath = path.join(signalDir, "codex.signal.json");
        const temporaryPath = `${signalPath}.tmp`;

        fs.writeFileSync(
            temporaryPath,
            JSON.stringify(signal, null, 2),
            "utf8"
        );

        fs.renameSync(temporaryPath, signalPath);
    } catch (error) {
        fs.appendFileSync(
            logPath,
            `[${new Date().toISOString()}] ERROR: ${
                error instanceof Error ? error.stack : String(error)
            }\n`,
            "utf8"
        );
    }

    // 通知 Hook 出错也不要影响 Codex 会话
    process.exit(0);
});

process.stdin.on("error", error => {
    fs.appendFileSync(logPath, `STDIN ERROR: ${String(error)}\n`, "utf8");
    process.exit(0);
});