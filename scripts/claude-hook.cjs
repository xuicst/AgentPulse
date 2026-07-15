const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");

const signalDir = path.join(
    os.homedir(),
    ".agentpulse",
    "signals"
);

fs.mkdirSync(signalDir, {
    recursive: true
});

const signalFile = path.join(
    signalDir,
    "claude.signal.json"
);

let payload = {};

try {
    payload = JSON.parse(fs.readFileSync(0, "utf8"));
} catch {
    payload = {};
}

const signal = {
    id: crypto.randomUUID(),
    source: "claude",
    event: "ClaudeHook",
    timestamp: Date.now(),
    payload
};

fs.writeFileSync(
    signalFile,
    JSON.stringify(signal, null, 2)
);
