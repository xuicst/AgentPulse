# AgentPulse

> Extensión de VS Code que envía notificaciones locales de escritorio cuando Claude Code o Codex necesita permiso, termina, falla o se cancela.

[English](README.md) | [简体中文](README.zh-CN.md) | [Français](README.fr.md) | [Русский](README.ru.md) | [Español](README.es.md)

AgentPulse te ayuda a conocer el estado de tu agente de IA mientras trabajas en otra cosa. Los eventos Hook se procesan localmente y su contenido nunca se envía por la red.

## Cómo funciona

```text
Hook de Claude Code / Codex
            ↓
~/.agentpulse/signals/*.signal.json
            ↓
Detector de AgentPulse → EventBus → servicio de notificaciones → notificación del sistema
```

## Funciones

- Compatible con Claude Code y Codex.
- Notifica solicitudes de permiso, finalización, errores y cancelaciones.
- Instala los Hooks al habilitarse por primera vez; no hace falta editar manualmente el código de Hook.
- Usa un mecanismo de notificación nativo en cada plataforma y muestra un mensaje de VS Code como alternativa si falla.
- Cada paquete de plataforma contiene solo los archivos que necesita.

## Compatibilidad de plataformas

| Plataforma | Mecanismo de notificación | Estado |
| --- | --- | --- |
| Windows x64 | Windows Toast Helper nativo incluido | Verificado en Windows |
| macOS Intel / Apple Silicon | `osascript` integrado y Centro de notificaciones | Implementado; pendiente de verificación en un Mac real |
| Ubuntu y otros escritorios Linux gráficos | Helper incluido mediante el servicio de notificaciones D-Bus de la sesión gráfica actual | Implementado; pendiente de verificación en Linux real |

No es necesario instalar por separado .NET Runtime ni `notify-send`. Los scripts Hook necesitan el comando `node` en el `PATH`; normalmente está disponible junto con Claude Code o Codex.

Por ahora AgentPulse se ejecuta en el host de interfaz local de VS Code. Las notificaciones locales de escritorio aún no son compatibles con Remote SSH, Dev Containers, WSL ni Codespaces.

## Instalación

### Desde Open VSX (disponible ahora)

AgentPulse está publicado actualmente en [Open VSX](https://open-vsx.org/extension/xuicst/AgentPulse). Los editores compatibles con Open VSX pueden instalarlo desde la vista Extensions.

AgentPulse **aún no está publicado en Visual Studio Marketplace**. Por ahora, los usuarios de VS Code estándar deben instalar el paquete VSIX correspondiente.

### Desde un archivo VSIX

1. Descarga el VSIX que corresponda a tu sistema y CPU: `win32-x64`, `darwin-x64`, `darwin-arm64`, `linux-x64` o `linux-arm64`.
2. En VS Code, abre la vista Extensions y selecciona `...`.
3. Elige **Install from VSIX...** y selecciona el archivo descargado.
4. Recarga VS Code cuando se te solicite.

También puedes ejecutar:

```bash
code --install-extension AgentPulse-<platform>-<version>.vsix
```

`win32-x64` significa **Windows de 64 bits**. `win32` es el identificador histórico que VS Code usa para la plataforma Windows; no indica un paquete exclusivo para 32 bits.

## Primer uso

1. Instala la extensión y recarga VS Code.
2. Al iniciarse, selecciona **Enable** para cada agente que uses o ejecuta los comandos siguientes desde la paleta de comandos.
3. AgentPulse copia sus scripts Hook a `~/.agentpulse/hooks` y agrega únicamente sus propias entradas Hook a la configuración de usuario del agente correspondiente.
4. Reinicia Codex y aprueba la actualización de Hooks si Codex lo solicita. Claude Code normalmente detecta la actualización de configuración automáticamente.

No se requiere editar código fuente ni archivos de configuración.

### Comandos de la paleta

- `AgentPulse: Enable Codex Notifications`
- `AgentPulse: Enable Claude Notifications`
- `AgentPulse: Test Notification`
- `AgentPulse: Show Output`
- `AgentPulse: Restart`

## Configuración

Busca `AgentPulse` en Settings de VS Code o edita `settings.json`. Por ejemplo, para conservar solo las notificaciones de permiso y finalización:

```json
{
  "agentPulse.notifications.permission": true,
  "agentPulse.notifications.completed": true,
  "agentPulse.notifications.failed": false,
  "agentPulse.notifications.cancelled": false
}
```

| Ajuste | Predeterminado | Propósito |
| --- | --- | --- |
| `agentPulse.enabled` | `true` | Interruptor principal |
| `agentPulse.debug` | `false` | Activar registros de depuración |
| `agentPulse.statusBar.enabled` | `true` | Mostrar el elemento de barra de estado |
| `agentPulse.notifications.desktop` | `true` | Activar notificaciones de escritorio del sistema |
| `agentPulse.notifications.level` | `important` | Nivel: `all`, `important` o `none` |
| `agentPulse.notifications.permission` | `true` | Solicitudes de permiso |
| `agentPulse.notifications.completed` | `true` | Finalización del trabajo |
| `agentPulse.notifications.failed` | `true` | Errores |
| `agentPulse.notifications.cancelled` | `true` | Cancelación o denegación |
| `agentPulse.detectors.codex` | `true` | Activar el detector de Codex |
| `agentPulse.detectors.claude` | `true` | Activar el detector de Claude |

## Privacidad e impacto en el sistema

- Los eventos Hook se escriben en `~/.agentpulse/signals` y se usan solo para notificaciones locales.
- AgentPulse no carga datos Hook ni contiene telemetría o solicitudes de red.
- Los errores de Hook de Codex se registran en la salida local de la extensión, pero la entrada sin procesar de Hook no se registra.
- En Windows, AgentPulse registra un identificador de aplicación de notificaciones en el registro del usuario actual. No necesita derechos de administrador, no modifica la política global de notificaciones y no ejecuta un proceso persistente en segundo plano.
- En macOS utiliza un script integrado del sistema y en Linux el servicio de notificaciones de la sesión gráfica actual. Los avisos y sonidos siguen siendo controlados por la configuración del sistema operativo.

## Desarrollo y empaquetado

Requisitos: Node.js 22+. Para compilar el Helper nativo de Windows o Linux también se necesita la cadena de herramientas de Rust. El paquete de macOS usa el mecanismo integrado y no requiere un Helper nativo.

```bash
npm ci
npm run check
npm run compile
```

Compilar un paquete de plataforma:

```bash
npm run package:win32-x64
npm run package:darwin-x64
npm run package:darwin-arm64
npm run package:linux-x64
npm run package:linux-arm64
```

GitHub Actions compila los cinco paquetes en los runners nativos correspondientes. Los archivos `.vsix` generados, las carpetas Rust `target` y las salidas de compilación .NET heredadas son ignorados por Git.

## Contribuciones

Se agradecen issues, pasos de reproducción y pull requests. Para cambios relacionados con notificaciones, indica el sistema operativo, arquitectura, versión de VS Code y versión del agente que probaste. Son especialmente útiles los comentarios desde Mac reales y Linux gráficos.

## Licencia

Este proyecto se distribuye bajo la [licencia MIT](LICENSE).
