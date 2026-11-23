import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowDownUp, ArrowRight, Check, ChevronDown, Clock3, Compass, Globe2,
  Heart, Menu, Plus, Search, Settings2, Sunrise, Sunset, X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { CITIES, getClockParts, getLocalDate, getOffset, getPossibleInstants, getSunTimes, getTimezoneAbbreviation, isDaytime, isValidTimezone } from './time'
import type { City } from './time'

type Page = 'home' | 'clock' | 'converter' | 'timeline' | 'explore'
type Popup = 'search' | 'notifications' | 'profile' | null

const STORAGE = {
  cities: 'world-time:cities',
  favorites: 'world-time:favorites',
  format: 'world-time:24-hour',
}

function readStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) as T : fallback
  } catch (error) {
    console.warn(`Could not read ${key} from local storage.`, error)
    return fallback
  }
}

function useLocalStorage<T>(key: string, fallback: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => readStorage(key, fallback))
  const update = (next: T) => {
    setValue(next)
    try {
      localStorage.setItem(key, JSON.stringify(next))
    } catch (error) {
      console.warn(`Could not save ${key} to local storage.`, error)
    }
  }
  return [value, update]
}

function getInitialCities(): City[] {
  const ids = readStorage<string[]>(STORAGE.cities, ['mumbai', 'dubai', 'london', 'new-york', 'tokyo', 'singapore', 'sydney', 'hubballi'])
  const custom = readStorage<City[]>('world-time:custom-cities', [])
  const cities = [...CITIES, ...custom]
  return ids.map((id) => cities.find((city) => city.id === id)).filter((city): city is City => Boolean(city))
}

function CityCard({
  city, now, use24Hour, favorite, onFavorite, onRemove,
}: {
  city: City
  now: Date
  use24Hour: boolean
  favorite: boolean
  onFavorite: () => void
  onRemove?: () => void
}) {
  const time = getClockParts(now, city.timezone, use24Hour)
  const daytime = isDaytime(now, city.timezone, city.latitude, city.longitude)
  const hasCoordinates = city.latitude !== undefined && city.longitude !== undefined
  const [imageFailed, setImageFailed] = useState(false)
  return (
    <motion.article
      className={`city-card ${imageFailed ? 'image-fallback' : ''}`}
      whileHover={{ y: -5, scale: 1.012 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      layout
    >
      <img className="city-card-image" src={city.image} alt="" aria-hidden="true" loading="lazy" onError={() => setImageFailed(true)} />
      <div className="card-topline">
        <span className="time-status" title={hasCoordinates ? undefined : 'Estimated from local clock time; city coordinates are unavailable'}><span className={daytime ? 'status-dot day' : 'status-dot night'} />{daytime ? 'DAYTIME' : 'NIGHTTIME'}{!hasCoordinates && ' · EST.'}</span>
        <div className="card-actions">
          <button type="button" className={`icon-button favorite-button ${favorite ? 'is-favorite' : ''}`} onClick={onFavorite} aria-label={`${favorite ? 'Remove' : 'Add'} ${city.name} ${favorite ? 'from' : 'to'} favorites`} title={favorite ? 'Remove from favorites' : 'Add to favorites'}>
            <Heart size={16} fill={favorite ? 'currentColor' : 'none'} />
          </button>
          {onRemove && <button type="button" className="icon-button remove-button" onClick={onRemove} aria-label={`Remove ${city.name}`} title="Remove city"><X size={15} /></button>}
        </div>
      </div>
      <div className="city-card-copy">
        <div className="city-name-line"><span className="city-flag">{city.flag}</span><h3>{city.name}</h3></div>
        <div className="city-time-line">
          <span className="city-time">{time.hours}:{time.minutes}</span>
          {!use24Hour && <span className="city-period">{time.period}</span>}
          <span className="city-seconds">{time.seconds}</span>
        </div>
        <div className="city-meta"><span>{city.timezone.replaceAll('_', ' ')}</span><span>{getOffset(now, city.timezone)}</span></div>
      </div>
    </motion.article>
  )
}

function Brand() {
  return <div className="brand"><span className="brand-mark"><img src={`${import.meta.env.BASE_URL}world-time-mark.svg`} alt="" aria-hidden="true" /></span><span>WORLD<span className="brand-light">TIME</span></span></div>
}

function App() {
  const [now, setNow] = useState(() => new Date())
  const [page, setPage] = useState<Page>('home')
  const [cities, setCities] = useState<City[]>(getInitialCities)
  const [favorites, setFavorites] = useLocalStorage<string[]>(STORAGE.favorites, ['mumbai', 'tokyo'])
  const [use24Hour, setUse24Hour] = useLocalStorage<boolean>(STORAGE.format, false)
  const [popup, setPopup] = useState<Popup>(null)
  const [query, setQuery] = useState('')
  const [mobileMenu, setMobileMenu] = useState(false)
  const [sourceId, setSourceId] = useState('mumbai')
  const [destinationId, setDestinationId] = useState('london')
  const [occurrence, setOccurrence] = useState<'earlier' | 'later'>('earlier')
  const [globeImageFailed, setGlobeImageFailed] = useState(false)
  const [convertDate, setConvertDate] = useState(() => getLocalDate(new Date(), 'Asia/Kolkata'))
  const [convertTime, setConvertTime] = useState(() => new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date()))

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setPopup('search')
      } else if (event.key === 'Escape') {
        setPopup(null)
      }
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE.cities, JSON.stringify(cities.map((city) => city.id)))
    } catch (error) {
      console.warn('Could not save city list to local storage.', error)
    }
  }, [cities])

  const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  const localCity = CITIES.find((city) => city.timezone === localTimezone) ??
    (localTimezone === 'Asia/Calcutta' ? CITIES.find((city) => city.timezone === 'Asia/Kolkata') : undefined)
  const localTime = getClockParts(now, localTimezone, use24Hour)
  const localDate = new Intl.DateTimeFormat('en-US', { timeZone: localTimezone, weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(now)
  const localOffset = getOffset(now, localTimezone)
  const localZoneLabel = getTimezoneAbbreviation(now, localTimezone)
  const savedTimezoneCount = new Set(cities.map((city) => city.timezone)).size
  const sunInfo = localCity?.latitude !== undefined && localCity.longitude !== undefined
    ? getSunTimes(now, localCity.latitude, localCity.longitude, localTimezone)
    : null
  const timezoneCount = new Set(CITIES.map((city) => city.timezone)).size
  const pages: { id: Page; label: string; icon: typeof Globe2 }[] = [
    { id: 'home', label: 'Home', icon: Compass },
    { id: 'clock', label: 'World clock', icon: Globe2 },
    { id: 'converter', label: 'Converter', icon: ArrowDownUp },
    { id: 'timeline', label: 'Timeline', icon: Clock3 },
    { id: 'explore', label: 'Explore', icon: Compass },
  ]

  const searchResults = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return CITIES.filter((city) => !cities.some((saved) => saved.id === city.id)).slice(0, 5)
    const known = CITIES.filter((city) =>
      `${city.name} ${city.country} ${city.timezone}`.toLowerCase().includes(normalized) &&
      !cities.some((saved) => saved.id === city.id),
    ).slice(0, 5)
    if (known.length > 0 || !normalized.includes('/')) return known
    if (!isValidTimezone(query.trim())) return []
    const timezone = query.trim()
    const name = timezone.split('/').pop()?.replaceAll('_', ' ') ?? timezone
    const id = `custom-${timezone.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
    if (cities.some((saved) => saved.timezone === timezone)) return []
    return [{
      id, name, country: 'Custom time zone', flag: '🌐', timezone,
      image: CITIES[2].image,
    }]
  }, [query, cities])

  const navigate = (next: Page) => {
    setPage(next)
    setPopup(null)
    setMobileMenu(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const addCity = (city: City) => {
    if (cities.some((saved) => saved.id === city.id)) return
    const next = [...cities, city]
    setCities(next)
    if (city.id.startsWith('custom-')) {
      const currentCustom = readStorage<City[]>('world-time:custom-cities', [])
      try {
        localStorage.setItem('world-time:custom-cities', JSON.stringify([...currentCustom, city]))
      } catch (error) {
        console.warn('Could not save custom time zone.', error)
      }
    }
    setQuery('')
    setPopup(null)
  }

  const removeCity = (id: string) => {
    setCities((current) => current.filter((city) => city.id !== id))
    if (favorites.includes(id)) setFavorites(favorites.filter((favorite) => favorite !== id))
  }

  const toggleFavorite = (id: string) => {
    setFavorites(favorites.includes(id) ? favorites.filter((favorite) => favorite !== id) : [...favorites, id])
  }

  const source = CITIES.find((city) => city.id === sourceId) ?? CITIES[0]
  const destination = CITIES.find((city) => city.id === destinationId) ?? CITIES[2]
  const conversion = useMemo((): { date: Date | null; error: string; alternatives: Date[] } => {
    if (!convertDate || !convertTime) return { date: null, error: 'Choose a date and time to convert.', alternatives: [] }
    try {
      const alternatives = getPossibleInstants(convertDate, convertTime, source.timezone)
      if (alternatives.length === 0) {
        return {
          date: null,
          error: `That local time does not exist in ${source.timezone} because the clocks move forward. Choose a later time.`,
          alternatives,
        }
      }
      const index = occurrence === 'later' ? alternatives.length - 1 : 0
      return { date: alternatives[index], error: '', alternatives }
    } catch (error) {
      return { date: null, error: error instanceof Error ? error.message : 'Unable to convert this time.', alternatives: [] }
    }
  }, [convertDate, convertTime, source.timezone, occurrence])
  const converted = conversion.date
  const sourceOffset = converted ? getOffset(converted, source.timezone) : getOffset(now, source.timezone)
  const destinationOffset = converted ? getOffset(converted, destination.timezone) : getOffset(now, destination.timezone)
  const offsetMinutes = (offset: string) => {
    const match = offset.match(/UTC([+-])(\d{2}):(\d{2})/)
    if (!match) return 0
    return (match[1] === '-' ? -1 : 1) * (Number(match[2]) * 60 + Number(match[3]))
  }
  const difference = offsetMinutes(destinationOffset) - offsetMinutes(sourceOffset)
  const differenceLabel = `${difference >= 0 ? '+' : '−'}${Math.floor(Math.abs(difference) / 60)}h${Math.abs(difference) % 60 ? ` ${Math.abs(difference) % 60}m` : ''}`
  const timelineRows = useMemo(() => {
    const utcDayStart = Math.floor(now.getTime() / 86400000) * 86400000
    return cities.map((city) => ({
      city,
      hours: Array.from({ length: 24 }, (_, hour) => {
        const instant = new Date(utcDayStart + hour * 3600000)
        const localTime = new Intl.DateTimeFormat('en-US', { timeZone: city.timezone, hour: 'numeric', minute: '2-digit', hour12: true }).format(instant)
        return { daytime: isDaytime(instant, city.timezone, city.latitude, city.longitude), localTime }
      }),
    }))
  }, [cities, Math.floor(now.getTime() / 3600000)])

  const togglePopup = (name: Exclude<Popup, null>) => setPopup(popup === name ? null : name)
  const renderCard = (city: City, removable = false) => (
    <CityCard
      key={city.id}
      city={city}
      now={now}
      use24Hour={use24Hour}
      favorite={favorites.includes(city.id)}
      onFavorite={() => toggleFavorite(city.id)}
      onRemove={removable ? () => removeCity(city.id) : undefined}
    />
  )

  const renderContent = () => {
    if (page === 'home') {
      return (
        <>
          <section className="hero-panel">
            <div className="hero-copy">
              <div className="eyebrow"><span className="live-pulse" /> YOUR WORLD, IN REAL TIME</div>
              <h1>WORLD<br /><span>TIME.</span></h1>
              <p className="hero-description">The world doesn’t stop. Stay in sync with every timezone, every sunrise, every second.</p>
              <div className="hero-actions">
                <button className="button button-primary" type="button" onClick={() => navigate('explore')}>Explore cities <ArrowRight size={16} /></button>
                <button className="button button-secondary" type="button" onClick={() => navigate('converter')}><ArrowDownUp size={15} /> Time converter</button>
              </div>
              <div className="hero-footnote"><span><span className="tiny-pulse" /> LIVE GLOBAL TIME</span><span className="hero-footnote-separator" /><span>UPDATED EVERY SECOND</span></div>
            </div>
            <div className="earth-stage" aria-label="Animated view of Earth from space">
              <div className="earth-orbit orbit-one" /><div className="earth-orbit orbit-two" />
              <div className="earth-glow" />
              <div className={`earth ${globeImageFailed ? 'image-fallback' : ''}`}><img className="earth-image" src={`${import.meta.env.BASE_URL}cities/globe.webp`} alt="" aria-hidden="true" onError={() => setGlobeImageFailed(true)} /><div className="earth-shade" /><div className="earth-clouds" /></div>
              <div className="earth-label label-london"><span className="map-ping" />LONDON <b>{getClockParts(now, 'Europe/London', use24Hour).hours}:{getClockParts(now, 'Europe/London', use24Hour).minutes}</b></div>
              <div className="earth-label label-tokyo"><span className="map-ping" />TOKYO <b>{getClockParts(now, 'Asia/Tokyo', use24Hour).hours}:{getClockParts(now, 'Asia/Tokyo', use24Hour).minutes}</b></div>
              <div className="earth-label label-newyork"><span className="map-ping" />NEW YORK <b>{getClockParts(now, 'America/New_York', use24Hour).hours}:{getClockParts(now, 'America/New_York', use24Hour).minutes}</b></div>
              <div className="orbit-note"><span className="orbit-note-line" /> {timezoneCount} TIME ZONES <span className="orbit-note-dot" /></div>
            </div>
            <div className="hero-bottom">
              <div className="local-clock">
                <div className="local-clock-label"><span className="local-indicator" /> YOUR LOCAL TIME <span className="local-zone">{localZoneLabel}</span></div>
                <div className="local-time-readout">
                  <motion.span key={`${localTime.hours}:${localTime.minutes}:${localTime.seconds}`} className="local-time-digits" initial={{ opacity: 0.55, y: 7 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.14 }}>
                    {localTime.hours}:{localTime.minutes}<span className="local-seconds">:{localTime.seconds}</span>
                  </motion.span>
                  {!use24Hour && <span className="local-period">{localTime.period}</span>}
                </div>
                <div className="local-date">{localDate} <span>·</span> {localOffset}</div>
              </div>
              <div className="sun-times">
                <div className="sun-time-item"><span className="sun-icon"><Sunrise size={15} /></span><div><small>SUNRISE</small><strong>{sunInfo?.sunrise ?? '—'}</strong></div></div>
                <div className="sun-time-divider" />
                <div className="sun-time-item"><span className="sun-icon sunset"><Sunset size={15} /></span><div><small>SUNSET</small><strong>{sunInfo?.sunset ?? '—'}</strong></div></div>
              </div>
              <div className="local-location"><span className="location-flag">{localCity?.flag ?? '🌍'}</span><div><strong>{localCity?.name ?? localTimezone.split('/').pop()?.replaceAll('_', ' ') ?? 'Local time'}</strong><span>{localTimezone.replaceAll('_', ' ')}</span></div><span className="location-arrow">↗</span></div>
            </div>
          </section>
          <section className="city-section">
            <div className="section-heading">
              <div><div className="eyebrow section-eyebrow">YOUR WORLD CLOCK</div><h2>Time around the world<span className="heading-period">.</span></h2></div>
              <button type="button" className="text-button" onClick={() => navigate('clock')}>View all cities <ArrowRight size={15} /></button>
            </div>
            {cities.length > 0 ? <div className="city-grid">{cities.slice(0, 8).map((city) => renderCard(city))}</div> : <EmptyState onExplore={() => navigate('explore')} />}
          </section>
          <section className="bottom-banner">
            <div className="banner-icon"><Globe2 size={22} /></div><div><strong>Good things happen in every timezone.</strong><span>Find a time that works for everyone.</span></div>
            <button type="button" className="button button-quiet" onClick={() => navigate('converter')}>Plan across time zones <ArrowRight size={15} /></button>
          </section>
        </>
      )
    }

    if (page === 'clock') {
      return (
        <section className="page-section">
          <PageHeading eyebrow="THE WORLD, RIGHT NOW" title="World clock" description="Your saved cities, all in one place. Every clock stays perfectly in sync." />
          <div className="filter-row"><span className="saved-count">{cities.length} {cities.length === 1 ? 'CITY' : 'CITIES'} SAVED</span><button type="button" className="button button-secondary compact-button" onClick={() => togglePopup('search')}><Plus size={15} /> Add a city</button></div>
          {cities.length > 0 ? <div className="city-grid">{cities.map((city) => renderCard(city, true))}</div> : <EmptyState onExplore={() => navigate('explore')} />}
        </section>
      )
    }

    if (page === 'converter') {
      return (
        <section className="page-section converter-page">
          <PageHeading eyebrow="MAKE EVERY MINUTE COUNT" title="Time converter" description="Find the perfect time to connect, wherever you both are." />
          <div className="converter-card">
            <div className="converter-fields">
              <div className="converter-city-fields">
                <CitySelect label="FROM" value={sourceId} cities={CITIES} onChange={setSourceId} />
                <button className="swap-button" type="button" aria-label="Swap source and destination cities" onClick={() => { setSourceId(destinationId); setDestinationId(sourceId) }}><ArrowDownUp size={17} /></button>
                <CitySelect label="TO" value={destinationId} cities={CITIES} onChange={setDestinationId} />
              </div>
              <div className="date-time-fields">
                <label className="field-label">DATE<input type="date" required value={convertDate} onChange={(event) => setConvertDate(event.target.value)} /></label>
                <label className="field-label">TIME<input type="time" required value={convertTime} onChange={(event) => setConvertTime(event.target.value)} /></label>
              </div>
              {conversion.alternatives.length > 1 && <label className="ambiguity-field"><span>THIS LOCAL TIME OCCURS TWICE</span><select value={occurrence} onChange={(event) => setOccurrence(event.target.value === 'later' ? 'later' : 'earlier')}>{conversion.alternatives.map((instant, index) => <option key={instant.getTime()} value={index === 0 ? 'earlier' : 'later'}>{index === 0 ? 'First' : 'Second'} occurrence · {new Intl.DateTimeFormat('en-US', { timeZone: source.timezone, hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }).format(instant)}</option>)}</select><small>Clocks move back on this date; select which occurrence to convert.</small></label>}
              <div className="converter-footnote"><span><span className="live-pulse" /> DAYLIGHT SAVING AWARE</span><span>Automatic IANA timezone conversion</span></div>
            </div>
            <div className="conversion-result">
              <div className="result-heading"><span>YOUR CONVERTED TIME</span><span className="result-live-dot" /> LIVE PREVIEW</div>
              {converted && (
                <>
                  <div className="result-city"><span>{destination.flag}</span><span>{destination.name}, {destination.country}</span></div>
                  <div className="result-time">{new Intl.DateTimeFormat('en-US', { timeZone: destination.timezone, hour: 'numeric', minute: '2-digit', hour12: !use24Hour }).format(converted)}</div>
                  <div className="result-date">{new Intl.DateTimeFormat('en-US', { timeZone: destination.timezone, weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(converted)}</div>
                  <div className="result-difference"><span className="difference-icon"><ArrowRight size={14} /></span>{difference === 0 ? <span>{source.name} and {destination.name} share the same time</span> : <span>{destination.name} is <strong>{differenceLabel}</strong> {difference > 0 ? 'ahead of' : 'behind'} {source.name}</span>}</div>
                  <div className="result-zones"><span>{source.name} <strong>{sourceOffset}</strong></span><ArrowRight size={13} /><span>{destination.name} <strong>{destinationOffset}</strong></span></div>
                </>
              )}
              {conversion.error && <p className="form-error" role="alert">{conversion.error}</p>}
              <p className="result-disclaimer">Times are calculated using official timezone rules and adjust automatically for daylight saving.</p>
            </div>
          </div>
        </section>
      )
    }

    if (page === 'timeline') {
      return (
        <section className="page-section">
          <PageHeading eyebrow="A DAY WITHOUT BORDERS" title="Global timeline" description="See the rhythm of the day unfold across the cities you follow." />
          <div className="timeline-card">
            <div className="timeline-top"><div><span className="eyebrow section-eyebrow">24-HOUR WORLD VIEW</span><h3>Daylight, at a glance</h3></div><span className="timeline-now"><span className="live-pulse" /> NOW · {new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', hour: 'numeric', minute: '2-digit', hour12: !use24Hour }).format(now)} UTC</span></div>
            <div className="timeline-legend"><span><i className="legend-day" /> Daylight</span><span><i className="legend-night" /> Night</span><span><i className="legend-current" /> Current instant</span></div>
            <div className="timeline-grid">
              <div className="timeline-ruler"><span className="ruler-city-label">CITY</span><div className="ruler-hours">{Array.from({ length: 13 }, (_, index) => <span key={index}>{`${String(index * 2).padStart(2, '0')}:00`}</span>)}</div></div>
              {timelineRows.map(({ city, hours }) => {
                const markerPosition = (now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600) / 24 * 100
                return <div className="timeline-row" key={city.id}><div className="timeline-city"><span>{city.flag}</span><strong>{city.name}</strong><small>{getOffset(now, city.timezone)}</small></div><div className="timeline-track">{hours.map((hour, index) => <span key={index} className={`timeline-hour ${hour.daytime ? 'daylight' : 'nighttime'}`} title={`${city.name}: ${hour.localTime}`} />)}<span className="timeline-marker" style={{ left: `${markerPosition}%` }} title={`Current instant in ${city.name}`} /></div></div>
              })}
            </div>
          </div>
        </section>
      )
    }

    return (
      <section className="page-section explore-page">
        <PageHeading eyebrow="A LITTLE CLOSER TO EVERYWHERE" title="Explore the world" description="Discover the cities shaping the moment. Add a place to your world clock." />
        <div className="explore-toolbar"><span>{CITIES.length} CITIES <span className="explore-dot">·</span> {timezoneCount} TIME ZONES</span><button className="button button-secondary compact-button" type="button" onClick={() => togglePopup('search')}><Search size={15} /> Search cities</button></div>
        <div className="city-grid explore-grid">{CITIES.map((city) => {
          const added = cities.some((saved) => saved.id === city.id)
          return <div className="explore-card-wrap" key={city.id}>{renderCard(city)}<button type="button" className={`explore-add ${added ? 'added' : ''}`} onClick={() => added ? navigate('clock') : addCity(city)} aria-label={added ? `${city.name} is already in your clock` : `Add ${city.name} to your world clock`}>{added ? <><Check size={14} /> Added</> : <><Plus size={14} /> Add city</>}</button></div>
        })}</div>
      </section>
    )
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a href="#" className="brand-link" onClick={(event) => { event.preventDefault(); navigate('home') }} aria-label="World Time home"><Brand /></a>
        <nav className={`main-nav ${mobileMenu ? 'mobile-open' : ''}`} aria-label="Main navigation">
          {pages.map(({ id, label }) => <button key={id} type="button" className={`nav-link ${page === id ? 'active' : ''}`} aria-current={page === id ? 'page' : undefined} onClick={() => navigate(id)}>{label}</button>)}
        </nav>
        <div className="topbar-actions">
          <button type="button" className={`topbar-search ${popup === 'search' ? 'search-active' : ''}`} onClick={() => togglePopup('search')} aria-label="Search for a city"><Search size={15} /><span>Search city</span><kbd>⌘ K</kbd></button>
          <button type="button" className={`icon-button top-icon ${popup === 'notifications' ? 'active' : ''}`} aria-label="World time snapshot" onClick={() => togglePopup('notifications')}><Globe2 size={17} /></button>
          <button type="button" className={`profile-button ${popup === 'profile' ? 'active' : ''}`} aria-label="Display preferences" onClick={() => togglePopup('profile')}><span><Settings2 size={15} /></span><ChevronDown size={13} /></button>
          <button type="button" className="icon-button mobile-menu-button" onClick={() => setMobileMenu(!mobileMenu)} aria-label={mobileMenu ? 'Close navigation' : 'Open navigation'}>{mobileMenu ? <X size={18} /> : <Menu size={18} />}</button>
        </div>
        <AnimatePresence>
          {popup === 'search' && <motion.div className="search-popover popup-panel" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.16 }}>
            <div className="search-input-wrap"><Search size={17} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a city or IANA timezone…" onKeyDown={(event) => { if (event.key === 'Escape') setPopup(null); if (event.key === 'Enter' && searchResults[0]) addCity(searchResults[0]) }} /><button type="button" onClick={() => setPopup(null)} aria-label="Close search"><X size={16} /></button></div>
            <div className="search-result-label">{query ? 'MATCHING CITIES' : 'POPULAR CITIES'}</div>
            {searchResults.length ? searchResults.map((city) => <button className="search-result" key={city.id} type="button" onClick={() => addCity(city)}><span className="search-result-flag">{city.flag}</span><span className="search-result-copy"><strong>{city.name}</strong><small>{city.country} · {city.timezone}</small></span><Plus size={16} /></button>) : <div className="no-results">{cities.some((city) => city.name.toLowerCase() === query.trim().toLowerCase() || city.timezone.toLowerCase() === query.trim().toLowerCase()) ? 'This city is already in your world clock.' : query.includes('/') ? 'No matching timezone. Check the IANA name and try again.' : 'No cities found. Try a city name or an IANA timezone such as Asia/Kolkata.'}</div>}
            <div className="search-hint"><kbd>↵</kbd> to add <span>·</span> Search supports IANA timezones too</div>
          </motion.div>}
          {popup === 'notifications' && <motion.div className="utility-popover popup-panel" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.16 }}><div className="popover-title">Live world snapshot<span className="popover-pill">LIVE</span></div><div className="notification-item"><span className="notification-icon"><Globe2 size={16} /></span><div><strong>{cities.length} saved cities · {savedTimezoneCount} time zones</strong><small>All clocks update from your device’s current time.</small></div></div><div className="notification-item"><span className="notification-icon warm"><Sunrise size={16} /></span><div><strong>{localCity ? `${localCity.name} sunrise · ${sunInfo?.sunrise ?? '—'}` : 'Local sunrise data unavailable'}</strong><small>{sunInfo ? `Sunset · ${sunInfo.sunset} local time` : 'Solar times require a known city location.'}</small></div></div><button type="button" className="popover-link" onClick={() => navigate('timeline')}>View global timeline <ArrowRight size={14} /></button></motion.div>}
          {popup === 'profile' && <motion.div className="utility-popover profile-popover popup-panel" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.16 }}><div className="profile-summary"><span className="profile-avatar"><Settings2 size={16} /></span><div><strong>Display preferences</strong><small>Personalize your clock view</small></div></div><div className="format-setting"><span><Settings2 size={15} /> Time format</span><div className="format-switch"><button type="button" className={!use24Hour ? 'selected' : ''} onClick={() => setUse24Hour(false)}>12h</button><button type="button" className={use24Hour ? 'selected' : ''} onClick={() => setUse24Hour(true)}>24h</button></div></div><div className="settings-note">Your preferences are saved on this device.</div></motion.div>}
        </AnimatePresence>
      </header>
      <main>
        <AnimatePresence mode="wait">
          <motion.div key={page} className="page-transition" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -7 }} transition={{ duration: 0.24, ease: 'easeOut' }}>
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
      <footer className="footer"><Brand /><span>Every city. Every moment. <span className="footer-dot">●</span> All times are local.</span><span className="footer-right">A LITTLE MORE IN SYNC <span>© 2026 WORLD TIME</span></span></footer>
      {popup && <button className="dismiss-layer" onClick={() => setPopup(null)} aria-label="Close menu" />}
      {popup === 'search' && <div className="search-layer" onClick={() => setPopup(null)} />}
    </div>
  )
}

function PageHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="page-heading"><div className="eyebrow section-eyebrow">{eyebrow}</div><h1>{title}<span className="heading-period">.</span></h1><p>{description}</p></div>
}

function CitySelect({ label, value, cities, onChange }: { label: string; value: string; cities: City[]; onChange: (value: string) => void }) {
  const city = cities.find((item) => item.id === value) ?? cities[0]
  return <label className="city-select-wrap"><span className="field-label">{label}</span><span className="city-select-control"><span className="select-flag">{city.flag}</span><select value={value} onChange={(event) => onChange(event.target.value)}>{cities.map((item) => <option value={item.id} key={item.id}>{item.name}, {item.country}</option>)}</select><ChevronDown size={15} /></span><small>{city.timezone}</small></label>
}

function EmptyState({ onExplore }: { onExplore: () => void }) {
  return <div className="empty-state"><div className="empty-globe"><Globe2 size={25} /></div><h3>Your world is waiting.</h3><p>Add a city to see its local time here.</p><button className="button button-primary" type="button" onClick={onExplore}>Explore cities <ArrowRight size={15} /></button></div>
}

export default App
