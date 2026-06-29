import * as vscode from "vscode";
import { Lifecycle } from "./core/lifecycle";

let lifecycle: Lifecycle | undefined;

export async function activate(
    context: vscode.ExtensionContext
): Promise<void> {
    lifecycle = new Lifecycle();
    await lifecycle.initialize(context);
}

export function deactivate(): void {
    lifecycle?.dispose();
    lifecycle = undefined;
}