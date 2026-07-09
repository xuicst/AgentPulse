import * as fs from "fs";
import * as path from "path";
import { SignalFileEvent } from "./signalTypes";

export function writeSignalFile(
    filePath: string,
    event: SignalFileEvent
): void {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(
        filePath,
        JSON.stringify(event, null, 2),
        "utf8"
    );
}