import { INotificationService } from "./notificationService";
import { LinuxNotifier } from "./linuxNotifier";
import { MacOsNotifier } from "./macosNotifier";
import { NativeHelperNotifier } from "./nativeHelperNotifier";

export function createPlatformNotifier(
    extensionPath: string,
    platform = process.platform,
    architecture = process.arch
): INotificationService | undefined {
    const nativeHelper = platform === "darwin"
        ? undefined
        : NativeHelperNotifier.create(
            extensionPath,
            platform,
            architecture
        );
    if (nativeHelper) {
        return nativeHelper;
    }

    switch (platform) {
        case "darwin":
            return new MacOsNotifier();

        case "linux":
            return new LinuxNotifier();

        default:
            return undefined;
    }
}
