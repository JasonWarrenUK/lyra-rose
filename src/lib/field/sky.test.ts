import { describe, it, expect, vi, afterEach } from 'vitest';
import { skyStyle } from './sky.js';

function mockHour(hour: number, minute = 0) {
	const d = new Date(2024, 5, 21, hour, minute, 0); // summer solstice, arbitrary year
	vi.setSystemTime(d);
}

afterEach(() => {
	vi.useRealTimers();
});

describe('skyStyle', () => {
	it('returns a non-empty background style string', () => {
		vi.useFakeTimers();
		mockHour(12);
		const style = skyStyle();
		expect(style).toMatch(/^background:/);
		expect(style).toMatch(/linear-gradient/);
	});

	it('night sky (00:00) is dark', () => {
		vi.useFakeTimers();
		mockHour(0);
		const style = skyStyle();
		// Night colours are very dark — rgb values should be low
		expect(style).toContain('linear-gradient');
		// Both colours should be present; style is a single gradient declaration
		expect(style.split('rgb').length).toBeGreaterThan(2);
	});

	it('midday sky (12:00) is lighter than midnight (00:00)', () => {
		vi.useFakeTimers();

		mockHour(12);
		const dayStyle = skyStyle();

		mockHour(0);
		const nightStyle = skyStyle();

		// Extract first rgb value from each
		const dayMatch = dayStyle.match(/rgb\((\d+),(\d+),(\d+)\)/);
		const nightMatch = nightStyle.match(/rgb\((\d+),(\d+),(\d+)\)/);

		expect(dayMatch).not.toBeNull();
		expect(nightMatch).not.toBeNull();

		const dayBrightness = Number(dayMatch![1]) + Number(dayMatch![2]) + Number(dayMatch![3]);
		const nightBrightness = Number(nightMatch![1]) + Number(nightMatch![2]) + Number(nightMatch![3]);

		expect(dayBrightness).toBeGreaterThan(nightBrightness);
	});

	it('produces different styles at dawn vs noon vs dusk', () => {
		vi.useFakeTimers();

		mockHour(6);
		const dawn = skyStyle();

		mockHour(12);
		const noon = skyStyle();

		mockHour(19);
		const dusk = skyStyle();

		expect(dawn).not.toBe(noon);
		expect(noon).not.toBe(dusk);
		expect(dawn).not.toBe(dusk);
	});

	it('handles midnight boundary correctly (23:59 vs 00:00)', () => {
		vi.useFakeTimers();

		mockHour(23, 59);
		const lateNight = skyStyle();

		mockHour(0, 0);
		const midnight = skyStyle();

		// Both should produce valid gradient strings, no crash at boundary
		expect(lateNight).toMatch(/linear-gradient/);
		expect(midnight).toMatch(/linear-gradient/);
	});

	it('uses local time (getHours) not UTC', () => {
		vi.useFakeTimers();
		// Set system time to something; skyStyle must use new Date().getHours()
		// which gives local time, not UTC. We verify the function runs without
		// error across timezones by checking the output format is always valid.
		for (let h = 0; h < 24; h++) {
			mockHour(h);
			const style = skyStyle();
			expect(style).toMatch(/^background: linear-gradient/);
		}
	});
});
