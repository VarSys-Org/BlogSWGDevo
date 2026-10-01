import type { PostInput } from '../../schema';
import { mockCover } from '../cover';

export const post: PostInput = {
	slug: 'reduce-input-lag-pc',
	title: 'How to Reduce Input Lag on PC: 9 Fixes That Actually Work',
	description:
		'Nine tested ways to cut input lag in PC games, from refresh rate and FPS caps to Reflex, mouse polling and Windows settings. Ordered by impact.',
	kind: 'guide',
	category: 'hardware',
	tags: ['PC', 'Input lag', 'FPS boost', 'Settings'],
	games: ['valorant', 'counter-strike-2'],
	author: 'kavin-r',
	publishedAt: '2026-09-18T11:30:00+05:30',
	cover: mockCover('posts', 'reduce-input-lag-pc', 'Gaming mouse and keyboard lit in blue on a desk'),
	level: 'intermediate',
	keyPoints: [
		'Check that your monitor is really running at its full refresh rate.',
		'Use exclusive Fullscreen and turn on Reflex or Anti-Lag where the game offers it.',
		'Cap FPS slightly below or above refresh rate to keep frame times steady.',
		'Wired mouse at 1000 Hz polling is the safe default.',
	],
	faq: [
		{
			question: 'Does V-Sync cause input lag?',
			answer:
				'Classic V-Sync adds noticeable input lag because frames wait for the monitor. If you have a G-Sync or FreeSync screen, use adaptive sync with an FPS cap a few frames under the refresh rate instead.',
		},
		{
			question: 'Is 1000 Hz polling rate enough?',
			answer:
				'For almost everyone, yes. Higher polling rates can help on very high refresh monitors, but they also use more CPU. Start at 1000 Hz and only go higher if your PC stays smooth.',
		},
	],
	body: {
		format: 'markdown',
		value: `
**Short answer:** most input lag comes from a low or unsteady frame rate and from display settings. Fix those first; the small tweaks at the end only matter once the big ones are done.

## 1. Confirm your refresh rate

Open Windows display settings, then Advanced display, and pick the highest refresh rate. Monitors and laptops often ship at 60 Hz even when they support 144 Hz or more. This is the biggest free fix on this list.

## 2. Use Fullscreen mode

Exclusive Fullscreen usually has the lowest delay. Borderless or windowed modes go through extra Windows compositing in some games.

## 3. Turn on Reflex or Anti-Lag

NVIDIA Reflex and AMD Anti-Lag shorten the queue of frames waiting for your GPU. Turn them on in every game that offers them.

## 4. Cap your frame rate

A steady 160 FPS feels better than a frame rate jumping between 140 and 300. Cap in-game when possible.

## 5. Handle sync properly

- **Adaptive sync screen:** turn on G-Sync or FreeSync and cap FPS 3 to 5 under the refresh rate.
- **No adaptive sync:** leave V-Sync off and accept some tearing for the lowest delay.

## 6. Lower the settings that cost the most

Shadows, volumetric effects and high anti-aliasing cost the most frames. Lowering them raises FPS, which directly lowers delay.

## 7. Mouse polling rate

Set your mouse to 1000 Hz in its software. Use a wired connection or a modern 2.4 GHz wireless dongle, not Bluetooth.

## 8. Windows Game Mode and power plan

Turn on Game Mode and use the Balanced or High performance power plan. On laptops, plug in while gaming: many lower their clock speed on battery.

## 9. Close what you do not need

Browsers with video, RGB software and overlays all take CPU time. Close them during ranked matches.

## How to measure the difference

The easiest check is the in-game latency or performance overlay that many shooters include, or the NVIDIA overlay that shows system latency. Change one setting at a time and compare.
`,
	},
};
