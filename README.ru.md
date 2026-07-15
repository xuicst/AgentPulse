# AgentPulse

> Расширение VS Code, которое отправляет локальные уведомления рабочего стола, когда Claude Code или Codex запрашивает разрешение, завершает работу, завершается с ошибкой или отменяется.

[English](README.md) | [简体中文](README.zh-CN.md) | [Français](README.fr.md) | [Русский](README.ru.md) | [Español](README.es.md)

AgentPulse помогает не пропустить состояние ИИ-агента, пока вы заняты другой работой. События Hook обрабатываются локально; их содержимое никогда не отправляется по сети.

## Как это работает

```text
Hook Claude Code / Codex
            ↓
~/.agentpulse/signals/*.signal.json
            ↓
Детектор AgentPulse → EventBus → служба уведомлений → системное уведомление
```

## Возможности

- Поддержка Claude Code и Codex.
- Уведомления о запросах разрешения, завершении, ошибках и отменах.
- Установка Hooks при первом включении без ручного редактирования кода Hook.
- Нативный механизм уведомлений для каждой платформы и сообщение VS Code как резервный вариант.
- В каждый платформенный пакет входят только необходимые ему файлы.

## Поддерживаемые платформы

| Платформа | Механизм уведомлений | Состояние |
| --- | --- | --- |
| Windows x64 | Встроенный нативный Windows Toast Helper | Проверено в Windows |
| macOS Intel / Apple Silicon | Встроенный `osascript` и Центр уведомлений | Реализовано; ожидается проверка на реальном Mac |
| Ubuntu и другие графические Linux | Встроенный Helper через службу уведомлений D-Bus текущей графической сессии | Реализовано; ожидается проверка на реальном Linux |

Не требуется отдельно устанавливать .NET Runtime или `notify-send`. Скриптам Hook нужна команда `node` в `PATH`; обычно она уже доступна вместе с Claude Code или Codex.

Сейчас AgentPulse работает в локальном UI Host VS Code. Локальные уведомления рабочего стола пока не поддерживаются для Remote SSH, Dev Containers, WSL и Codespaces.

## Установка

### Через Open VSX (доступно сейчас)

AgentPulse сейчас опубликован на [Open VSX](https://open-vsx.org/extension/xuicst/AgentPulse). Редакторы, совместимые с Open VSX, могут установить его из представления Extensions.

AgentPulse **ещё не опубликован в Visual Studio Marketplace**. Пользователям стандартного VS Code пока следует установить подходящий пакет VSIX.

### Из файла VSIX

1. Скачайте VSIX для вашей системы и процессора: `win32-x64`, `darwin-x64`, `darwin-arm64`, `linux-x64` или `linux-arm64`.
2. В VS Code откройте Extensions и выберите `...`.
3. Выберите **Install from VSIX...** и укажите скачанный файл.
4. Перезагрузите VS Code по запросу.

Или выполните:

```bash
code --install-extension AgentPulse-<platform>-<version>.vsix
```

`win32-x64` означает **64-битную Windows**. `win32` — историческое имя платформы Windows в VS Code, а не обозначение пакета только для 32-битной системы.

## Первый запуск

1. Установите расширение и перезагрузите VS Code.
2. При запуске выберите **Enable** для каждого используемого агента либо выполните команды ниже из палитры команд.
3. AgentPulse копирует скрипты Hook в `~/.agentpulse/hooks` и добавляет в пользовательскую конфигурацию агента только собственные записи Hook.
4. Перезапустите Codex и подтвердите изменение Hooks, если Codex спросит. Claude Code обычно замечает обновление настроек автоматически.

Редактировать исходный код или файлы конфигурации не требуется.

### Команды палитры

- `AgentPulse: Enable Codex Notifications`
- `AgentPulse: Enable Claude Notifications`
- `AgentPulse: Test Notification`
- `AgentPulse: Show Output`
- `AgentPulse: Restart`

## Настройка

Найдите `AgentPulse` в настройках VS Code или отредактируйте `settings.json`. Например, чтобы оставить только уведомления о разрешении и завершении:

```json
{
  "agentPulse.notifications.permission": true,
  "agentPulse.notifications.completed": true,
  "agentPulse.notifications.failed": false,
  "agentPulse.notifications.cancelled": false
}
```

| Параметр | По умолчанию | Назначение |
| --- | --- | --- |
| `agentPulse.enabled` | `true` | Главный переключатель |
| `agentPulse.debug` | `false` | Включить журналы отладки |
| `agentPulse.statusBar.enabled` | `true` | Показывать элемент строки состояния |
| `agentPulse.notifications.desktop` | `true` | Включить системные уведомления |
| `agentPulse.notifications.level` | `important` | Уровень: `all`, `important` или `none` |
| `agentPulse.notifications.permission` | `true` | Запросы разрешения |
| `agentPulse.notifications.completed` | `true` | Завершение работы |
| `agentPulse.notifications.failed` | `true` | Ошибки |
| `agentPulse.notifications.cancelled` | `true` | Отмена или отказ |
| `agentPulse.detectors.codex` | `true` | Включить детектор Codex |
| `agentPulse.detectors.claude` | `true` | Включить детектор Claude |

## Конфиденциальность и влияние на систему

- События Hook записываются в `~/.agentpulse/signals` и используются только для локальных уведомлений.
- AgentPulse не загружает данные Hook и не содержит телеметрии или сетевых запросов.
- Ошибки Hook Codex записываются в локальный вывод расширения, но исходный ввод Hook не сохраняется.
- В Windows AgentPulse регистрирует один идентификатор приложения для уведомлений в реестре текущего пользователя. Права администратора не нужны; глобальная политика уведомлений не меняется, постоянный фоновый процесс не запускается.
- В macOS используется встроенный системный скрипт, а в Linux — служба уведомлений текущей графической сессии. Баннеры и звуки определяются настройками ОС.

## Разработка и упаковка

Требуется Node.js 22+. Для сборки нативного Helper для Windows или Linux также нужна цепочка инструментов Rust. Пакет macOS использует встроенный механизм и не требует нативного Helper.

```bash
npm ci
npm run check
npm run compile
```

Сборка пакета платформы:

```bash
npm run package:win32-x64
npm run package:darwin-x64
npm run package:darwin-arm64
npm run package:linux-x64
npm run package:linux-arm64
```

GitHub Actions собирает пять пакетов на соответствующих нативных runners. Сгенерированные `.vsix`, каталоги Rust `target` и устаревшие результаты сборки .NET игнорируются Git.

## Участие в разработке

Приветствуются issues, шаги воспроизведения и pull requests. Для изменений, связанных с уведомлениями, укажите проверенные ОС, архитектуру, версию VS Code и версию агента. Особенно полезны отзывы с реальных Mac и графических Linux.

## Лицензия

Проект распространяется по [лицензии MIT](LICENSE).
