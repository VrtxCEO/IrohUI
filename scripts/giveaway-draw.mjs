#!/usr/bin/env node
/**
 * giveaway-draw.mjs — draw the monthly Eyro Mini giveaway winner.
 *
 * Follows the official rules (eyro.io/giveaway): everyone in the Discord
 * server at the end of the month is entered, and one is drawn at random.
 *
 *   DISCORD_BOT_TOKEN=... DISCORD_GUILD_ID=... node scripts/giveaway-draw.mjs 2027-01
 *
 * Options:
 *   --exclude id,id   Discord user ids that can't win (Sponsor's staff).
 *   --members file    Read members from a JSON file instead of Discord (testing).
 *
 * Run it again for the same month to draw an alternate when a winner forfeits;
 * everyone already drawn that month is left out.
 *
 * The bot needs the Server Members Intent (Developer Portal → Bot) and to be
 * in the server. Each draw is saved to giveaway-draws/<month>.json, which
 * holds members' ids and names, so that folder stays out of git. Anyone in
 * those files has been drawn before, and can't be drawn again.
 *
 * Limitation: Discord lists who is in the server now. Someone who left after
 * the month ended, before the draw, is missed; run the draw early in the month.
 */
import { createHash, randomInt } from 'node:crypto'
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const DRAWS_DIR = path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1')), '..', 'giveaway-draws')
const TZ = 'America/Chicago'

function args() {
  const out = { exclude: [], members: null, period: null }
  const a = process.argv.slice(2)
  for (let i = 0; i < a.length; i++) {
    if (a[i] === '--exclude') out.exclude = a[++i].split(',').map((s) => s.trim()).filter(Boolean)
    else if (a[i] === '--members') out.members = a[++i]
    else out.period = a[i]
  }
  if (!/^\d{4}-\d{2}$/.test(out.period ?? '')) fail('Give the month to draw as YYYY-MM, e.g. 2027-01')
  return out
}

function fail(msg) {
  console.error(msg)
  process.exit(1)
}

/** The instant a month's entry period ends: midnight Central at the start of the next month. */
function periodEnd(period) {
  const [y, m] = period.split('-').map(Number)
  const next = new Date(Date.UTC(m === 12 ? y + 1 : y, m === 12 ? 0 : m, 1))
  const offset = new Intl.DateTimeFormat('en-US', { timeZone: TZ, timeZoneName: 'shortOffset' })
    .formatToParts(next).find((p) => p.type === 'timeZoneName').value // e.g. "GMT-6"
  const hours = Number(offset.replace('GMT', '') || 0)
  return new Date(next.getTime() - hours * 3600_000)
}

async function fetchMembers() {
  const token = process.env.DISCORD_BOT_TOKEN
  const guild = process.env.DISCORD_GUILD_ID
  if (!token || !guild) fail('Set DISCORD_BOT_TOKEN and DISCORD_GUILD_ID')
  const members = []
  let after = '0'
  for (;;) {
    const res = await fetch(`https://discord.com/api/v10/guilds/${guild}/members?limit=1000&after=${after}`, {
      headers: { Authorization: `Bot ${token}` },
    })
    if (res.status === 429) {
      const { retry_after } = await res.json()
      await new Promise((r) => setTimeout(r, Math.ceil(retry_after * 1000)))
      continue
    }
    if (!res.ok) fail(`Discord said ${res.status}: ${await res.text()}\n(Is the Server Members Intent on, and the bot in the server?)`)
    const page = await res.json()
    members.push(...page)
    if (page.length < 1000) return members
    after = page[page.length - 1].user.id
  }
}

async function pastDraws() {
  await mkdir(DRAWS_DIR, { recursive: true })
  const files = (await readdir(DRAWS_DIR)).filter((f) => /^\d{4}-\d{2}\.json$/.test(f))
  return Promise.all(files.map(async (f) => JSON.parse(await readFile(path.join(DRAWS_DIR, f), 'utf8'))))
}

async function main() {
  const { period, exclude, members: membersFile } = args()
  const end = periodEnd(period)
  if (Date.now() < end.getTime()) fail(`The ${period} entry period hasn't ended yet (ends ${end.toISOString()}).`)

  const members = membersFile ? JSON.parse(await readFile(membersFile, 'utf8')) : await fetchMembers()
  const draws = await pastDraws()
  const thisMonth = draws.find((d) => d.period === period)
  // Anyone drawn before, in any month and whether they claimed or forfeited,
  // can't be drawn again.
  const out = new Set(exclude)
  for (const d of draws) d.draws.forEach((x) => out.add(x.id))

  const eligible = members
    .filter((m) => !m.user.bot && new Date(m.joined_at) < end && !out.has(m.user.id))
    .map((m) => ({ id: m.user.id, name: m.user.global_name ?? m.user.username, username: m.user.username }))
    .sort((a, b) => a.id.localeCompare(b.id))
  if (!eligible.length) fail('No eligible members.')

  const winner = eligible[randomInt(eligible.length)]
  const record = thisMonth ?? { period, periodEnd: end.toISOString(), draws: [] }
  record.draws.push({
    drawnAt: new Date().toISOString(),
    eligibleCount: eligible.length,
    // Fingerprint of exactly who was in the draw, so it can be checked later.
    eligibleSha256: createHash('sha256').update(eligible.map((e) => e.id).join('\n')).digest('hex'),
    excluded: [...out],
    ...winner,
  })
  record.eligible = eligible
  await writeFile(path.join(DRAWS_DIR, `${period}.json`), JSON.stringify(record, null, 2) + '\n')

  const n = record.draws.length
  console.log(`${period}${n > 1 ? ` (alternate #${n - 1})` : ''}: ${eligible.length} eligible members`)
  console.log(`Winner: ${winner.name} (@${winner.username}, id ${winner.id})`)
  console.log(`Saved to giveaway-draws/${period}.json`)
}

main()
