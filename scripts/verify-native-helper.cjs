const { existsSync, readFileSync } = require('fs');
const { join } = require('path');

const target = process.argv[2];
const expected = {
  'win32-x64': { extension: '.exe', format: 'pe', machine: 0x8664 },
  'linux-x64': { extension: '', format: 'elf', machine: 0x003e },
  'linux-arm64': { extension: '', format: 'elf', machine: 0x00b7 },
}[target];

if (!expected) {
  throw new Error(`Usage: node scripts/verify-native-helper.cjs <platform-target>`);
}

const binary = join(__dirname, '..', 'resources', target, `agentpulse-notify${expected.extension}`);
if (!existsSync(binary)) {
  throw new Error(`Native Helper is missing for ${target}: ${binary}`);
}

const bytes = readFileSync(binary);
if (expected.format === 'pe') {
  const offset = bytes.readUInt32LE(0x3c);
  if (bytes.subarray(0, 2).toString('ascii') !== 'MZ' || bytes.subarray(offset, offset + 4).toString('ascii') !== 'PE\0\0' || bytes.readUInt16LE(offset + 4) !== expected.machine) {
    throw new Error(`${binary} is not a ${target} PE binary.`);
  }
} else if (bytes.subarray(0, 4).toString('ascii') !== '\x7fELF' || bytes.readUInt16LE(18) !== expected.machine) {
  throw new Error(`${binary} is not a ${target} ELF binary.`);
}

console.log(`Verified native Helper for ${target}.`);
