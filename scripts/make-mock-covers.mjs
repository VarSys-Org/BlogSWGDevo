// Makes mock cover art, the default share image and app icons from SVG.
// Run: npm run mock:covers
// Output goes to public/images. Real covers from your backend replace these.

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'images');

const W = 1200;
const H = 675;

// [folder, slug, motif, hue A, hue B]
const COVERS = [
	['posts', 'best-valorant-settings', 'crosshair', '#3d7bff', '#ff4655'],
	['posts', 'minecraft-beginner-guide', 'blocks', '#3fb950', '#3d7bff'],
	['posts', 'reduce-input-lag-pc', 'pulse', '#3d7bff', '#22d3ee'],
	['posts', 'bgmi-sensitivity-guide', 'phone', '#f59e0b', '#3d7bff'],
	['posts', 'elden-ring-review', 'ring', '#e3b341', '#6366f1'],
	['posts', 'budget-gaming-pc-build', 'chip', '#22d3ee', '#3d7bff'],
	['posts', 'cs2-crosshair-guide', 'crosshair', '#3fb950', '#f59e0b'],
	['posts', 'fortnite-building-tips', 'ramps', '#a855f7', '#3d7bff'],
	['posts', 'best-free-pc-games', 'tiles', '#3d7bff', '#a855f7'],
	['posts', 'gaming-monitor-buying-guide', 'monitor', '#22d3ee', '#6366f1'],
	['posts', 'how-to-climb-ranked', 'ladder', '#f59e0b', '#3d7bff'],
	['posts', 'minecraft-redstone-basics', 'circuit', '#ef4444', '#3d7bff'],
	['posts', 'valorant-aim-routine', 'targets', '#ff4655', '#3d7bff'],
	['posts', 'swg-devo-blog-launch', 'logo', '#3d7bff', '#22d3ee'],
	['games', 'valorant', 'crosshair', '#ff4655', '#3d7bff'],
	['games', 'minecraft', 'blocks', '#3fb950', '#a16207'],
	['games', 'bgmi', 'phone', '#f59e0b', '#ef4444'],
	['games', 'elden-ring', 'ring', '#e3b341', '#3d7bff'],
	['games', 'counter-strike-2', 'targets', '#f59e0b', '#3d7bff'],
	['games', 'fortnite', 'ramps', '#a855f7', '#22d3ee'],
];

// Small seeded random so every run makes the same picture.
function makeRandom(seedText) {
	let seed = [...seedText].reduce((sum, ch) => (sum * 31 + ch.charCodeAt(0)) >>> 0, 7);
	return () => {
		seed = (seed * 1664525 + 1013904223) >>> 0;
		return seed / 4294967296;
	};
}

function hexagon(cx, cy, r) {
	const points = [];
	for (let i = 0; i < 6; i++) {
		const angle = (Math.PI / 3) * i - Math.PI / 2;
		points.push(`${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`);
	}
	return points.join(' ');
}

function drawMotif(motif, a, b, rand) {
	const cx = W * 0.66;
	const cy = H * 0.5;
	switch (motif) {
		case 'crosshair':
			return `
				<circle cx="${cx}" cy="${cy}" r="170" fill="none" stroke="${a}" stroke-width="6" opacity=".9"/>
				<circle cx="${cx}" cy="${cy}" r="96" fill="none" stroke="${b}" stroke-width="3" stroke-dasharray="14 10"/>
				<rect x="${cx - 4}" y="${cy - 250}" width="8" height="150" fill="${a}"/>
				<rect x="${cx - 4}" y="${cy + 100}" width="8" height="150" fill="${a}"/>
				<rect x="${cx - 250}" y="${cy - 4}" width="150" height="8" fill="${a}"/>
				<rect x="${cx + 100}" y="${cy - 4}" width="150" height="8" fill="${a}"/>
				<circle cx="${cx}" cy="${cy}" r="9" fill="${b}"/>`;
		case 'blocks': {
			let out = '';
			for (let i = 0; i < 26; i++) {
				const x = 560 + Math.floor(rand() * 9) * 66;
				const y = 120 + Math.floor(rand() * 7) * 66;
				const c = rand() > 0.5 ? a : b;
				out += `<rect x="${x}" y="${y}" width="60" height="60" rx="4" fill="${c}" opacity="${(0.35 + rand() * 0.6).toFixed(2)}"/>`;
			}
			return out;
		}
		case 'pulse': {
			let d = `M 480 ${cy}`;
			for (let x = 500; x <= 1180; x += 20) {
				const spike = x > 760 && x < 900 ? (rand() - 0.5) * 380 : (rand() - 0.5) * 40;
				d += ` L ${x} ${(cy + spike).toFixed(1)}`;
			}
			return `<path d="${d}" fill="none" stroke="${a}" stroke-width="6" stroke-linejoin="round"/>
				<path d="${d}" fill="none" stroke="${b}" stroke-width="18" opacity=".18"/>`;
		}
		case 'phone':
			return `
				<rect x="${cx - 260}" y="${cy - 135}" width="520" height="270" rx="36" fill="#0b0f19" stroke="${a}" stroke-width="6"/>
				<rect x="${cx - 228}" y="${cy - 105}" width="456" height="210" rx="18" fill="${b}" opacity=".22"/>
				<circle cx="${cx - 150}" cy="${cy + 30}" r="46" fill="none" stroke="${a}" stroke-width="5"/>
				<circle cx="${cx + 150}" cy="${cy + 10}" r="34" fill="${a}" opacity=".75"/>
				<circle cx="${cx + 80}" cy="${cy + 60}" r="22" fill="${b}" opacity=".85"/>`;
		case 'ring':
			return `
				<circle cx="${cx}" cy="${cy}" r="200" fill="none" stroke="${a}" stroke-width="10" opacity=".9"/>
				<circle cx="${cx}" cy="${cy}" r="150" fill="none" stroke="${a}" stroke-width="3" opacity=".6"/>
				<circle cx="${cx}" cy="${cy}" r="250" fill="none" stroke="${b}" stroke-width="2" opacity=".5"/>
				<path d="M ${cx - 30} ${cy + 230} L ${cx} ${cy - 60} L ${cx + 30} ${cy + 230} Z" fill="${a}" opacity=".85"/>`;
		case 'chip': {
			let pins = '';
			for (let i = 0; i < 7; i++) {
				const o = -150 + i * 50;
				pins += `<rect x="${cx + o - 6}" y="${cy - 230}" width="12" height="60" fill="${a}"/>`;
				pins += `<rect x="${cx + o - 6}" y="${cy + 170}" width="12" height="60" fill="${a}"/>`;
				pins += `<rect x="${cx - 230}" y="${cy + o - 6}" width="60" height="12" fill="${a}"/>`;
				pins += `<rect x="${cx + 170}" y="${cy + o - 6}" width="60" height="12" fill="${a}"/>`;
			}
			return `${pins}
				<rect x="${cx - 170}" y="${cy - 170}" width="340" height="340" rx="22" fill="#0b0f19" stroke="${b}" stroke-width="6"/>
				<rect x="${cx - 90}" y="${cy - 90}" width="180" height="180" rx="10" fill="${b}" opacity=".35"/>`;
		}
		case 'ramps': {
			let out = '';
			for (let i = 0; i < 5; i++) {
				const x = 560 + i * 110;
				const y = 560 - i * 90;
				out += `<path d="M ${x} ${y} L ${x + 150} ${y - 100} L ${x + 150} ${y} Z" fill="${i % 2 ? a : b}" opacity=".8"/>`;
				out += `<rect x="${x + 150}" y="${y - 180}" width="14" height="180" fill="${a}" opacity=".6"/>`;
			}
			return out;
		}
		case 'tiles': {
			let out = '';
			for (let r = 0; r < 3; r++) {
				for (let c = 0; c < 4; c++) {
					const lit = rand() > 0.55;
					out += `<rect x="${560 + c * 150}" y="${130 + r * 145}" width="134" height="128" rx="14" fill="${lit ? a : '#151b2b'}" stroke="${b}" stroke-opacity=".5" stroke-width="2" opacity="${lit ? 0.85 : 1}"/>`;
				}
			}
			return out;
		}
		case 'monitor':
			return `
				<rect x="${cx - 280}" y="${cy - 190}" width="560" height="320" rx="16" fill="#0b0f19" stroke="${a}" stroke-width="6"/>
				<path d="M ${cx - 250} ${cy + 90} Q ${cx - 60} ${cy - 220} ${cx + 250} ${cy - 40}" fill="none" stroke="${b}" stroke-width="10" opacity=".8"/>
				<rect x="${cx - 20}" y="${cy + 130}" width="40" height="70" fill="${a}" opacity=".7"/>
				<rect x="${cx - 110}" y="${cy + 195}" width="220" height="14" rx="7" fill="${a}" opacity=".7"/>`;
		case 'ladder': {
			let out = '';
			for (let i = 0; i < 6; i++) {
				const h = 70 + i * 60;
				out += `<rect x="${560 + i * 95}" y="${600 - h}" width="72" height="${h}" rx="8" fill="${i === 5 ? a : b}" opacity="${(0.3 + i * 0.12).toFixed(2)}"/>`;
			}
			out += `<polygon points="${hexagon(1035, 140, 54)}" fill="none" stroke="${a}" stroke-width="6"/>`;
			return out;
		}
		case 'circuit': {
			let out = '';
			for (let i = 0; i < 9; i++) {
				const y = 120 + i * 52;
				const x1 = 520 + Math.floor(rand() * 200);
				const x2 = x1 + 160 + Math.floor(rand() * 300);
				out += `<path d="M ${x1} ${y} H ${x2} V ${y + 26}" fill="none" stroke="${i % 3 ? b : a}" stroke-width="6" opacity=".85"/>`;
				out += `<circle cx="${x2}" cy="${y + 26}" r="10" fill="${a}"/>`;
			}
			return out;
		}
		case 'targets': {
			let out = '';
			for (let i = 0; i < 5; i++) {
				const x = 600 + rand() * 520;
				const y = 140 + rand() * 400;
				const r = 30 + rand() * 40;
				out += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(0)}" fill="none" stroke="${a}" stroke-width="5"/>
					<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(r / 3).toFixed(0)}" fill="${b}"/>`;
			}
			return out;
		}
		case 'logo':
		default:
			return `
				<polygon points="${hexagon(cx, cy, 210)}" fill="none" stroke="${a}" stroke-width="10"/>
				<polygon points="${hexagon(cx, cy, 250)}" fill="none" stroke="${b}" stroke-width="2" opacity=".5"/>
				<path d="M ${cx - 55} ${cy - 85} L ${cx + 85} ${cy} L ${cx - 55} ${cy + 85} Z" fill="${a}"/>`;
	}
}

function makeCoverSvg([, slug, motif, a, b]) {
	const rand = makeRandom(slug);
	let grid = '';
	for (let x = 0; x <= W; x += 60) grid += `<line x1="${x}" y1="0" x2="${x}" y2="${H}"/>`;
	for (let y = 0; y <= H; y += 60) grid += `<line x1="0" y1="${y}" x2="${W}" y2="${y}"/>`;
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
	<defs>
		<radialGradient id="glowA" cx="0.72" cy="0.45" r="0.6"><stop offset="0" stop-color="${a}" stop-opacity=".45"/><stop offset="1" stop-color="${a}" stop-opacity="0"/></radialGradient>
		<radialGradient id="glowB" cx="0.1" cy="0.95" r="0.6"><stop offset="0" stop-color="${b}" stop-opacity=".35"/><stop offset="1" stop-color="${b}" stop-opacity="0"/></radialGradient>
		<linearGradient id="base" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0d1220"/><stop offset="1" stop-color="#070910"/></linearGradient>
	</defs>
	<rect width="${W}" height="${H}" fill="url(#base)"/>
	<g stroke="#ffffff" stroke-opacity=".05" stroke-width="1">${grid}</g>
	<rect width="${W}" height="${H}" fill="url(#glowA)"/>
	<rect width="${W}" height="${H}" fill="url(#glowB)"/>
	${drawMotif(motif, a, b, rand)}
</svg>`;
}

function makeMarkSvg(size, padded) {
	const c = size / 2;
	const r = padded ? size * 0.36 : size * 0.46;
	const t = size * (padded ? 0.13 : 0.17);
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
	<rect width="${size}" height="${size}" rx="${padded ? size * 0.22 : 0}" fill="#0d1017"/>
	<polygon points="${hexagon(c, c, r)}" fill="none" stroke="#3d7bff" stroke-width="${size * 0.06}"/>
	<path d="M ${c - t * 0.7} ${c - t} L ${c + t} ${c} L ${c - t * 0.7} ${c + t} Z" fill="#e8ecf4"/>
</svg>`;
}

function makeShareSvg() {
	const cover = makeCoverSvg(['', 'og-default', 'logo', '#3d7bff', '#22d3ee'])
		.replace(`height="${H}" viewBox="0 0 ${W} ${H}"`, `height="630" viewBox="0 22 ${W} 630"`);
	return cover;
}

async function save(svg, path, kind, width) {
	await mkdir(dirname(path), { recursive: true });
	let img = sharp(Buffer.from(svg));
	if (width) img = img.resize({ width });
	const out = kind === 'webp' ? img.webp({ quality: 74 }) : kind === 'jpg' ? img.jpeg({ quality: 80, mozjpeg: true }) : img.png();
	await writeFile(path, await out.toBuffer());
}

for (const cover of COVERS) {
	const [folder, slug] = cover;
	const svg = makeCoverSvg(cover);
	const base = join(root, folder, slug);
	await save(svg, `${base}-1200.webp`, 'webp');
	await save(svg, `${base}-640.webp`, 'webp', 640);
	await save(svg, `${base}-1200.jpg`, 'jpg');
}

await save(makeShareSvg(), join(root, 'og-default.jpg'), 'jpg');
await save(makeMarkSvg(512, true), join(root, 'logo-512.png'), 'png');
await save(makeMarkSvg(192, true), join(root, 'icon-192.png'), 'png');
await save(makeMarkSvg(180, true), join(root, '..', 'apple-touch-icon.png'), 'png');
await writeFile(join(root, '..', 'favicon.svg'), makeMarkSvg(64, true));

console.log(`Made ${COVERS.length} covers, share image and icons in public/images`);
