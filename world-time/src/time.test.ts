import { describe, expect, it } from 'vitest'
import { convertLocalDateTime, getPossibleInstants, getSunTimes, isDaytime } from './time'

describe('timezone conversion around daylight-saving transitions', () => {
  it('converts an ordinary local time to its correct instant', () => {
    expect(convertLocalDateTime('2026-03-08', '03:30', 'America/New_York').toISOString())
      .toBe('2026-03-08T07:30:00.000Z')
  })

  it('rejects local times skipped when clocks move forward', () => {
    expect(getPossibleInstants('2026-03-08', '02:30', 'America/New_York')).toEqual([])
    expect(() => convertLocalDateTime('2026-03-08', '02:30', 'America/New_York'))
      .toThrow(/does not exist/)
  })

  it('exposes both instants for repeated local times when clocks move back', () => {
    const alternatives = getPossibleInstants('2026-11-01', '01:30', 'America/New_York')
    expect(alternatives.map((instant) => instant.toISOString())).toEqual([
      '2026-11-01T05:30:00.000Z',
      '2026-11-01T06:30:00.000Z',
    ])
    expect(convertLocalDateTime('2026-11-01', '01:30', 'America/New_York', 'earlier'))
      .toEqual(alternatives[0])
    expect(convertLocalDateTime('2026-11-01', '01:30', 'America/New_York', 'later'))
      .toEqual(alternatives[1])
  })

  it('validates input dates and times', () => {
    expect(() => getPossibleInstants('2026-02-30', '10:00', 'UTC')).toThrow(/valid/)
    expect(() => getPossibleInstants('2026-01-01', '24:00', 'UTC')).toThrow(/valid/)
  })
})

describe('city daylight calculations', () => {
  const london = { latitude: 51.5072, longitude: -0.1276, timezone: 'Europe/London' }

  it('calculates plausible London sunrise and sunset times', () => {
    const times = getSunTimes(new Date('2026-06-21T12:00:00Z'), london.latitude, london.longitude, london.timezone)
    expect(times.sunrise).toMatch(/^4:/)
    expect(times.sunset).toMatch(/^9:/)
  })

  it('distinguishes daylight from night using the city solar times', () => {
    expect(isDaytime(new Date('2026-06-21T12:00:00Z'), london.timezone, london.latitude, london.longitude)).toBe(true)
    expect(isDaytime(new Date('2026-06-21T23:00:00Z'), london.timezone, london.latitude, london.longitude)).toBe(false)
  })
})
