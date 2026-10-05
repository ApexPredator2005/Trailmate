/**
 * tests/weather.test.js — Weather Formatting & Fallback Unit Tests
 * (Suggestions #26 & #34)
 */

import { describe, it, expect } from 'vitest';
import {
  formatWeatherString,
  parseWeatherParts,
  renderWeatherBadgeContent,
} from '../src/services/api.js';

describe('Weather API Services & Formatters', () => {
  it('formatWeatherString should format numeric temperatures', () => {
    const res = formatWeatherString({
      temp_c: 24,
      condition: { text: 'Partly Cloudy' },
    });
    expect(res).toBe('24°C · Partly Cloudy');
  });

  it('formatWeatherString should handle N/A fallback when API is down (#26)', () => {
    const res = formatWeatherString({
      temp_c: 'N/A',
      condition: { text: 'Weather data unavailable' },
    });
    expect(res).toBe('N/A · Weather data unavailable');
  });

  it('parseWeatherParts should split formatted strings into temperature and conditions', () => {
    const { temp, cond } = parseWeatherParts('18°C · Gentle Mist');
    expect(temp).toBe('18°C');
    expect(cond).toBe('Gentle Mist');
  });

  it('renderWeatherBadgeContent should render sanitized HTML badge markup', () => {
    const html = renderWeatherBadgeContent('22°C · Clear Sky');
    expect(html).toContain('22°C');
    expect(html).toContain('Clear Sky');
    expect(html).toContain('dest-weather-temp');
  });

  it('renderWeatherBadgeContent should render only N/A when weather data is unavailable', () => {
    const html1 = renderWeatherBadgeContent('N/A · Weather data unavailable');
    expect(html1).toBe('<span class="dest-weather-temp font-mono font-bold text-[10.5px] text-white leading-none">N/A</span>');

    const html2 = renderWeatherBadgeContent('N/A');
    expect(html2).toBe('<span class="dest-weather-temp font-mono font-bold text-[10.5px] text-white leading-none">N/A</span>');
  });
});
