const { copyFileSync, existsSync, mkdirSync, readdirSync } = require('fs');
const { join } = require('path');
const { spawnSync } = require('child_process');

const targetByPlatform = {
  win32: { x64: 'win32-x64', arm64: 'win32-arm64' },
  darwin: { x64: 'darwin-x64', arm64: 'darwin-arm64' },
  linux: { x64: 'linux-x64', arm64: 'linux-arm64' },
};

const target = targetByPlatform[process.platform]?.[process.arch];
if (!target) {
  throw new Error(`Unsupported native Helper platform: ${process.platform}-${process.arch}`);
}

const root = join(__dirname, '..');
const manifest = join(root, 'tools', 'AgentPulse.NativeHelper', 'Cargo.toml');
function commandWorks(command) {
  const result = spawnSync(command, ['--version'], { stdio: 'ignore' });
  return !result.error && result.status === 0;
}

function findCargo() {
  const preferred = process.env.CARGO ?? 'cargo';
  if (commandWorks(preferred)) {
    return preferred;
  }

  if (process.platform !== 'win32' || !process.env.USERPROFILE) {
    throw new Error('Cargo is required to build the native Helper. Set CARGO or add cargo to PATH.');
  }

  const toolchains = join(process.env.USERPROFILE, '.rustup', 'toolchains');
  if (!existsSync(toolchains)) {
    throw new Error('Cargo is required to build the native Helper. Set CARGO or add cargo to PATH.');
  }

  for (const toolchain of readdirSync(toolchains)) {
    const candidate = join(toolchains, toolchain, 'bin', 'cargo.exe');
    if (existsSync(candidate) && commandWorks(candidate)) {
      return candidate;
    }
  }

  throw new Error('Cargo is required to build the native Helper. Set CARGO or add cargo to PATH.');
}

const cargo = findCargo();
const build = spawnSync(cargo, ['build', '--manifest-path', manifest, '--release'], {
  cwd: root,
  stdio: 'inherit',
});

if (build.error) {
  throw build.error;
}
if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

const extension = process.platform === 'win32' ? '.exe' : '';
const binary = join(root, 'tools', 'AgentPulse.NativeHelper', 'target', 'release', `agentpulse-notify${extension}`);
if (!existsSync(binary)) {
  throw new Error(`Native Helper binary was not produced: ${binary}`);
}

const destinationDirectory = join(root, 'resources', target);
mkdirSync(destinationDirectory, { recursive: true });
copyFileSync(binary, join(destinationDirectory, `agentpulse-notify${extension}`));
console.log(`Native Helper copied to resources/${target}.`);
