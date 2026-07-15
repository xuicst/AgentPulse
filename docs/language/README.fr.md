# AgentPulse

> Extension VS Code qui envoie des notifications de bureau locales lorsque Claude Code ou Codex demande une autorisation, termine, échoue ou est annulé.

[English](../../README.md) | [简体中文](README.zh-CN.md) | [Français](README.fr.md) | [Русский](README.ru.md) | [Español](README.es.md)

AgentPulse vous permet de rester informé de l'état de votre agent IA pendant que vous travaillez ailleurs. Les événements Hook sont traités localement et leur contenu n'est jamais envoyé sur le réseau.

## Fonctionnement

```text
Hook Claude Code / Codex
            ↓
~/.agentpulse/signals/*.signal.json
            ↓
Détecteur AgentPulse → EventBus → Service de notification → notification du système
```

## Fonctionnalités

- Prise en charge de Claude Code et Codex.
- Notifications pour les demandes d'autorisation, les fins de tâche, les échecs et les annulations.
- Installation des Hooks lors de la première activation, sans modification manuelle du code Hook.
- Mécanisme de notification natif selon la plateforme, avec repli vers un message VS Code en cas d'échec.
- Chaque paquet de plateforme ne contient que les fichiers nécessaires.

## Prise en charge des plateformes

| Plateforme | Mécanisme de notification | État |
| --- | --- | --- |
| Windows x64 | Windows Toast Helper natif fourni avec l'extension | Vérifié sous Windows |
| macOS Intel / Apple Silicon | `osascript` intégré et Centre de notifications | Implémenté ; en attente de vérification sur Mac réel |
| Ubuntu et autres bureaux Linux graphiques | Helper fourni utilisant le service de notification D-Bus de la session graphique | Implémenté ; en attente de vérification sur Linux réel |

Ni le runtime .NET ni `notify-send` ne doivent être installés séparément. Les scripts Hook nécessitent la commande `node` dans le `PATH` ; elle est normalement disponible avec Claude Code ou Codex.

AgentPulse s'exécute actuellement dans l'hôte UI local de VS Code. Les notifications de bureau locales ne sont pas encore prises en charge avec Remote SSH, Dev Containers, WSL ou Codespaces.

## Installation

### Depuis Open VSX (disponible maintenant)

AgentPulse est actuellement publié sur [Open VSX](https://open-vsx.org/extension/xuicst/AgentPulse). Les éditeurs compatibles avec Open VSX peuvent l'installer depuis leur vue Extensions.

AgentPulse n'est **pas encore publié sur Visual Studio Marketplace**. Les utilisateurs de VS Code standard doivent pour le moment installer le paquet VSIX correspondant.

### Depuis un fichier VSIX

1. Téléchargez le VSIX correspondant à votre système et processeur : `win32-x64`, `darwin-x64`, `darwin-arm64`, `linux-x64` ou `linux-arm64`.
2. Dans VS Code, ouvrez la vue Extensions et sélectionnez `...`.
3. Choisissez **Install from VSIX...**, puis sélectionnez le fichier téléchargé.
4. Rechargez VS Code lorsque cela est demandé.

Ou exécutez :

```bash
code --install-extension AgentPulse-<platform>-<version>.vsix
```

`win32-x64` signifie **Windows 64 bits**. `win32` est le nom historique employé par VS Code pour la plateforme Windows ; cela ne désigne pas un paquet réservé au 32 bits.

## Première utilisation

1. Installez l'extension et rechargez VS Code.
2. Au démarrage, sélectionnez **Enable** pour chaque agent utilisé, ou exécutez les commandes ci-dessous depuis la palette de commandes.
3. AgentPulse copie ses scripts Hook dans `~/.agentpulse/hooks` et ajoute uniquement ses propres entrées Hook à la configuration utilisateur de l'agent concerné.
4. Redémarrez Codex et acceptez la mise à jour des Hooks si Codex le demande. Claude Code détecte normalement la mise à jour automatiquement.

Aucune modification du code source ni des fichiers de configuration n'est nécessaire.

### Commandes de la palette

- `AgentPulse: Enable Codex Notifications`
- `AgentPulse: Enable Claude Notifications`
- `AgentPulse: Test Notification`
- `AgentPulse: Show Output`
- `AgentPulse: Restart`

## Configuration

Recherchez `AgentPulse` dans les paramètres de VS Code, ou modifiez `settings.json`. Par exemple, pour conserver uniquement les notifications d'autorisation et de fin :

```json
{
  "agentPulse.notifications.permission": true,
  "agentPulse.notifications.completed": true,
  "agentPulse.notifications.failed": false,
  "agentPulse.notifications.cancelled": false
}
```

| Paramètre | Valeur par défaut | Rôle |
| --- | --- | --- |
| `agentPulse.enabled` | `true` | Interrupteur principal |
| `agentPulse.debug` | `false` | Activer les journaux de débogage |
| `agentPulse.statusBar.enabled` | `true` | Afficher l'élément de barre d'état |
| `agentPulse.notifications.desktop` | `true` | Activer les notifications de bureau |
| `agentPulse.notifications.level` | `important` | Niveau : `all`, `important` ou `none` |
| `agentPulse.notifications.permission` | `true` | Demandes d'autorisation |
| `agentPulse.notifications.completed` | `true` | Fin de tâche |
| `agentPulse.notifications.failed` | `true` | Échec |
| `agentPulse.notifications.cancelled` | `true` | Annulation ou refus |
| `agentPulse.detectors.codex` | `true` | Activer le détecteur Codex |
| `agentPulse.detectors.claude` | `true` | Activer le détecteur Claude |

## Confidentialité et impact système

- Les événements Hook sont écrits dans `~/.agentpulse/signals` et servent uniquement aux notifications locales.
- AgentPulse ne téléverse pas les données Hook et ne contient ni télémétrie ni requête réseau.
- Les erreurs du Hook Codex sont consignées dans la sortie locale de l'extension, mais l'entrée brute du Hook n'est pas enregistrée.
- Sous Windows, AgentPulse enregistre un identifiant d'application de notification dans le registre de l'utilisateur courant. Il ne demande pas de droits administrateur, ne modifie pas la politique globale de notification et n'exécute pas de processus persistant.
- Sous macOS, il utilise un script système intégré. Sous Linux, il utilise le service de notification de la session graphique. Les bannières et les sons restent contrôlés par les réglages du système.

## Développement et empaquetage

Prérequis : Node.js 22+. La construction du Helper natif Windows ou Linux nécessite aussi la chaîne d'outils Rust. Le paquet macOS utilise le mécanisme intégré et ne nécessite pas de Helper natif.

```bash
npm ci
npm run check
npm run compile
```

Construire un paquet de plateforme :

```bash
npm run package:win32-x64
npm run package:darwin-x64
npm run package:darwin-arm64
npm run package:linux-x64
npm run package:linux-arm64
```

GitHub Actions construit les cinq paquets sur les runners natifs correspondants. Les fichiers `.vsix` générés, les dossiers Rust `target` et les sorties de compilation .NET historiques sont ignorés par Git.

## Contribution

Les issues, étapes de reproduction et pull requests sont bienvenus. Pour une modification liée aux notifications, indiquez le système, l'architecture, la version de VS Code et la version de l'agent testés. Les retours sur Mac réel et Linux graphique sont particulièrement utiles.

## Licence

Ce projet est distribué sous [licence MIT](../../LICENSE).
