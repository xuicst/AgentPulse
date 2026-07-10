using Microsoft.Windows.AppNotifications;
using Microsoft.Windows.AppNotifications.Builder;

var title = args.Length > 0 ? args[0] : "AgentPulse";
var message = args.Length > 1 ? args[1] : "Notification";

AppNotificationManager.Default.Register();

var notification = new AppNotificationBuilder()
    .AddText(title)
    .AddText(message)
    .BuildNotification();

AppNotificationManager.Default.Show(notification);