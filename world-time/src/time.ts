export type City = {
  id: string
  name: string
  country: string
  flag: string
  timezone: string
  image: string
  latitude?: number
  longitude?: number
}

const photo = (city: string) => `${import.meta.env.BASE_URL}cities/${city}.webp`

export const CITIES: City[] = [
  { id: 'mumbai', name: 'Mumbai', country: 'India', flag: '🇮🇳', timezone: 'Asia/Kolkata', image: photo('mumbai'), latitude: 19.076, longitude: 72.8777 },
  { id: 'dubai', name: 'Dubai', country: 'United Arab Emirates', flag: '🇦🇪', timezone: 'Asia/Dubai', image: photo('dubai'), latitude: 25.2048, longitude: 55.2708 },
  { id: 'london', name: 'London', country: 'United Kingdom', flag: '🇬🇧', timezone: 'Europe/London', image: photo('london'), latitude: 51.5072, longitude: -0.1276 },
  { id: 'new-york', name: 'New York', country: 'United States', flag: '🇺🇸', timezone: 'America/New_York', image: photo('new-york'), latitude: 40.7128, longitude: -74.006 },
  { id: 'tokyo', name: 'Tokyo', country: 'Japan', flag: '🇯🇵', timezone: 'Asia/Tokyo', image: photo('tokyo'), latitude: 35.6762, longitude: 139.6503 },
  { id: 'singapore', name: 'Singapore', country: 'Singapore', flag: '🇸🇬', timezone: 'Asia/Singapore', image: photo('singapore'), latitude: 1.3521, longitude: 103.8198 },
  { id: 'sydney', name: 'Sydney', country: 'Australia', flag: '🇦🇺', timezone: 'Australia/Sydney', image: photo('sydney'), latitude: -33.8688, longitude: 151.2093 },
  { id: 'hubballi', name: 'Hubballi', country: 'India', flag: '🇮🇳', timezone: 'Asia/Kolkata', image: photo('hubballi'), latitude: 15.3647, longitude: 75.124 },
  { id: 'paris', name: 'Paris', country: 'France', flag: '🇫🇷', timezone: 'Europe/Paris', image: photo('paris'), latitude: 48.8566, longitude: 2.3522 },
  { id: 'los-angeles', name: 'Los Angeles', country: 'United States', flag: '🇺🇸', timezone: 'America/Los_Angeles', image: photo('los-angeles'), latitude: 34.0522, longitude: -118.2437 },
  { id: 'hong-kong', name: 'Hong Kong', country: 'Hong Kong', flag: '🇭🇰', timezone: 'Asia/Hong_Kong', image: photo('hong-kong'), latitude: 22.3193, longitude: 114.1694 },
  { id: 'rome', name: 'Rome', country: 'Italy', flag: '🇮🇹', timezone: 'Europe/Rome', image: photo('rome'), latitude: 41.9028, longitude: 12.4964 },
  { id: 'berlin', name: 'Berlin', country: 'Germany', flag: '🇩🇪', timezone: 'Europe/Berlin', image: photo('berlin'), latitude: 52.52, longitude: 13.405 },
  { id: 'bangkok', name: 'Bangkok', country: 'Thailand', flag: '🇹🇭', timezone: 'Asia/Bangkok', image: photo('bangkok'), latitude: 13.7563, longitude: 100.5018 },
  { id: 'seoul', name: 'Seoul', country: 'South Korea', flag: '🇰🇷', timezone: 'Asia/Seoul', image: photo('seoul'), latitude: 37.5665, longitude: 126.978 },
  { id: 'toronto', name: 'Toronto', country: 'Canada', flag: '🇨🇦', timezone: 'America/Toronto', image: photo('toronto'), latitude: 43.6532, longitude: -79.3832 },
  { id: 'auckland', name: 'Auckland', country: 'New Zealand', flag: '🇳🇿', timezone: 'Pacific/Auckland', image: photo('auckland'), latitude: -36.8509, longitude: 174.7645 },
  { id: 'cairo', name: 'Cairo', country: 'Egypt', flag: '🇪🇬', timezone: 'Africa/Cairo', image: photo('cairo'), latitude: 30.0444, longitude: 31.2357 },
  { id: 'istanbul', name: 'Istanbul', country: 'Türkiye', flag: '🇹🇷', timezone: 'Europe/Istanbul', image: photo('istanbul'), latitude: 41.0082, longitude: 28.9784 },
  { id: 'mexico-city', name: 'Mexico City', country: 'Mexico', flag: '🇲🇽', timezone: 'America/Mexico_City', image: photo('mexico-city'), latitude: 19.4326, longitude: -99.1332 },
  { id: 'sao-paulo', name: 'São Paulo', country: 'Brazil', flag: '🇧🇷', timezone: 'America/Sao_Paulo', image: photo('sao-paulo'), latitude: -23.5505, longitude: -46.6333 },
  { id: 'cape-town', name: 'Cape Town', country: 'South Africa', flag: '🇿🇦', timezone: 'Africa/Johannesburg', image: photo('cape-town'), latitude: -33.9249, longitude: 18.4241 },
  { id: 'lisbon', name: 'Lisbon', country: 'Portugal', flag: '🇵🇹', timezone: 'Europe/Lisbon', image: photo('lisbon'), latitude: 38.7223, longitude: -9.1393 },
  { id: 'amsterdam', name: 'Amsterdam', country: 'Netherlands', flag: '🇳🇱', timezone: 'Europe/Amsterdam', image: photo('amsterdam'), latitude: 52.3676, longitude: 4.9041 },
]

export function getClockParts(date: Date, timezone: string, use24Hour: boolean) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: !use24Hour,
  }).formatToParts(date)
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? ''
  return { hours: part('hour'), minutes: part('minute'), seconds: part('second'), period: part('dayPeriod') }
}

export function getOffset(date: Date, timezone: string): string {
  const offset = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'longOffset',
  }).formatToParts(date).find((part) => part.type === 'timeZoneName')?.value ?? 'GMT'
  if (offset === 'GMT' || offset === 'GMT+00:00') return 'UTC+00:00'
  return offset.replace('GMT', 'UTC').replace(/([+-])(\d)(?=:)/, '$10$2')
}

export function getTimezoneAbbreviation(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'short',
  }).formatToParts(date).find((part) => part.type === 'timeZoneName')?.value ?? timezone
}

export function getLocalDate(date: Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? ''
  return `${part('year')}-${part('month')}-${part('day')}`
}

export function getPossibleInstants(date: string, time: string, timezone: string): Date[] {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(time)
  if (!dateMatch || !timeMatch) throw new RangeError('Enter a valid date and time.')

  const [, yearText, monthText, dayText] = dateMatch
  const [, hourText, minuteText] = timeMatch
  const year = Number(yearText)
  const month = Number(monthText)
  const day = Number(dayText)
  const hour = Number(hourText)
  const minute = Number(minuteText)
  const calendarDate = new Date(Date.UTC(year, month - 1, day))
  if (
    year < 100 || calendarDate.getUTCFullYear() !== year || calendarDate.getUTCMonth() !== month - 1 ||
    calendarDate.getUTCDate() !== day || hour > 23 || minute > 59
  ) {
    throw new RangeError('Enter a valid date and time.')
  }

  const intended = Date.UTC(year, month - 1, day, hour, minute)
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  })
  const partsAsUtc = (instant: Date) => {
    const parts = formatter.formatToParts(instant)
    const part = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((item) => item.type === type)?.value)
    return Date.UTC(part('year'), part('month') - 1, part('day'), part('hour'), part('minute'), part('second'))
  }
  const offsets = new Set<number>()
  for (let hours = -48; hours <= 48; hours += 6) {
    const sample = new Date(intended + hours * 3600000)
    offsets.add((partsAsUtc(sample) - sample.getTime()) / 60000)
  }

  const candidates = [...offsets]
    .map((offset) => new Date(intended - offset * 60000))
    .filter((candidate) => partsAsUtc(candidate) === intended)
    .sort((a, b) => a.getTime() - b.getTime())
  return candidates.filter((candidate, index) => index === 0 || candidate.getTime() !== candidates[index - 1].getTime())
}

export function convertLocalDateTime(date: string, time: string, timezone: string, occurrence: 'earlier' | 'later' = 'earlier'): Date {
  const candidates = getPossibleInstants(date, time, timezone)
  if (candidates.length === 0) {
    throw new RangeError(`That local time does not exist in ${timezone} because the clocks move forward. Choose a later time.`)
  }
  return occurrence === 'later' ? candidates[candidates.length - 1] : candidates[0]
}

function dayOfYear(date: Date): number {
  return Math.floor((Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - Date.UTC(date.getUTCFullYear(), 0, 0)) / 86400000)
}

export function getSunTimes(date: Date, latitude: number, longitude: number, timezone: string): { sunrise: string; sunset: string } {
  const [year, month, dayOfMonth] = getLocalDate(date, timezone).split('-').map(Number)
  const day = dayOfYear(new Date(Date.UTC(year, month - 1, dayOfMonth, 12)))
  const calculate = (sunrise: boolean): string => {
    const longitudeHour = longitude / 15
    const approximate = day + ((sunrise ? 6 : 18) - longitudeHour) / 24
    const meanAnomaly = 0.9856 * approximate - 3.289
    const trueLongitude = ((meanAnomaly + 1.916 * Math.sin(meanAnomaly * Math.PI / 180) + 0.02 * Math.sin(2 * meanAnomaly * Math.PI / 180) + 282.634) % 360 + 360) % 360
    let rightAscension = Math.atan(0.91764 * Math.tan(trueLongitude * Math.PI / 180)) * 180 / Math.PI
    rightAscension = (rightAscension + Math.floor(trueLongitude / 90) * 90 - Math.floor(rightAscension / 90) * 90 + 360) % 360
    rightAscension /= 15
    const sinDeclination = 0.39782 * Math.sin(trueLongitude * Math.PI / 180)
    const cosDeclination = Math.cos(Math.asin(sinDeclination))
    const cosineHour = (Math.cos(90.833 * Math.PI / 180) - sinDeclination * Math.sin(latitude * Math.PI / 180)) /
      (cosDeclination * Math.cos(latitude * Math.PI / 180))
    if (cosineHour > 1 || cosineHour < -1) return '—'
    const hourAngle = sunrise ? 360 - Math.acos(cosineHour) * 180 / Math.PI : Math.acos(cosineHour) * 180 / Math.PI
    const localMeanTime = hourAngle / 15 + rightAscension - 0.06571 * approximate - 6.622
    const utcHours = ((localMeanTime - longitudeHour) % 24 + 24) % 24
    const utcDate = new Date(Date.UTC(year, month - 1, dayOfMonth) + utcHours * 3600000)
    return new Intl.DateTimeFormat('en-US', { timeZone: timezone, hour: 'numeric', minute: '2-digit' }).format(utcDate)
  }
  return { sunrise: calculate(true), sunset: calculate(false) }
}

export function isDaytime(date: Date, timezone: string, latitude?: number, longitude?: number): boolean {
  if (latitude !== undefined && longitude !== undefined) {
    const { sunrise, sunset } = getSunTimes(date, latitude, longitude, timezone)
    const parseTime = (time: string): number | null => {
      const match = /^(\d{1,2}):(\d{2})\s?(AM|PM)$/i.exec(time)
      if (!match) return null
      const hour = Number(match[1]) % 12 + (match[3].toUpperCase() === 'PM' ? 12 : 0)
      return hour * 60 + Number(match[2])
    }
    const sunriseMinutes = parseTime(sunrise)
    const sunsetMinutes = parseTime(sunset)
    if (sunriseMinutes !== null && sunsetMinutes !== null) {
      const parts = new Intl.DateTimeFormat('en-US', { timeZone: timezone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(date)
      const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? 0)
      const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? 0)
      const localMinutes = hour * 60 + minute
      return localMinutes >= sunriseMinutes && localMinutes < sunsetMinutes
    }
  }
  const hour = Number(new Intl.DateTimeFormat('en-US', { timeZone: timezone, hour: 'numeric', hourCycle: 'h23' }).format(date))
  return hour >= 6 && hour < 18
}

export function isValidTimezone(timezone: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: timezone })
    return true
  } catch {
    return false
  }
}
