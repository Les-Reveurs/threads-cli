import test from 'node:test'
import assert from 'node:assert/strict'
import os from 'node:os'
import path from 'node:path'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'

import { getDoctorReport } from '../src/lib/doctor.js'

const withTempConfigDir = async (fn: (configDir: string) => Promise<void>) => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'threads-cli-doctor-test-'))
  process.env.THREADS_CLI_CONFIG_DIR = tempDir

  try {
    await fn(tempDir)
  } finally {
    delete process.env.THREADS_CLI_CONFIG_DIR
    await rm(tempDir, { recursive: true, force: true })
  }
}

test('doctor warns when auth prerequisites are missing', async () => {
  await withTempConfigDir(async (configDir) => {
    const report = await getDoctorReport()

    assert.equal(report.ok, false)
    assert.equal(report.configDir, configDir)
    assert.match(report.checks.find((check) => check.key === 'client_id')?.message ?? '', /missing/)
    assert.match(report.checks.find((check) => check.key === 'access_token')?.message ?? '', /missing/)
  })
})

test('doctor is ready when client id and token are configured', async () => {
  await withTempConfigDir(async (configDir) => {
    await writeFile(
      path.join(configDir, 'config.json'),
      JSON.stringify({
        activeProfile: 'default',
        profiles: {
          default: {
            clientId: 'client-123',
            accessToken: 'token-abc',
            accessTokenExpiresAt: '2030-01-01T00:00:00.000Z',
          },
        },
      }, null, 2),
    )

    const report = await getDoctorReport()

    assert.equal(report.ok, true)
    assert.equal(report.activeProfile, 'default')
    assert.match(report.checks.find((check) => check.key === 'client_id')?.message ?? '', /configured/)
    assert.match(report.checks.find((check) => check.key === 'access_token')?.message ?? '', /configured/)
  })
})
