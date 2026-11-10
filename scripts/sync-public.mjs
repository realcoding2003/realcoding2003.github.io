import { cp, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root = new URL('../', import.meta.url);
await mkdir(new URL('public/', root), { recursive: true });
for (const name of ['assets', 'CNAME', 'ads.txt', 'robots.txt']) {
  await cp(new URL(name, root), new URL(`public/${name}`, root), { recursive: true, force: true });
}
console.log(`Synced assets and hosting files to ${fileURLToPath(new URL('public/', root))}`);
