// One-off discovery script: probe examinations.ie for 2025 deferred papers and
// marking schemes. Deferred files reuse the regular paper filenames, so we probe
// the deferred archive path for each known 2025 regular filename and keep the
// ones that actually exist (HTTP 200/206).
//
// The SEC rate-limits aggressively (429), so this script:
//   * probes one request at a time with pacing,
//   * backs off (respecting Retry-After) on 429,
//   * caches every definitive exists/missing result to scripts/probe-cache.json
//     so it is fully resumable across runs.
// Re-run until it reports 0 unresolved, then it writes scripts/deferred-2025.json.
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const dataUrl = new URL("../src/app/files/data.json", import.meta.url);
const cacheUrl = new URL("./probe-cache.json", import.meta.url);
const outUrl = new URL("./deferred-2025.json", import.meta.url);

const data = JSON.parse(readFileSync(dataUrl, "utf8"));

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
const YEAR = "2025";
const CERTS = ["lc", "jc", "lb"];
const DELAY_MS = 350; // pacing between requests
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// probeURL -> "exists" | "missing"
const cache = existsSync(cacheUrl)
  ? JSON.parse(readFileSync(cacheUrl, "utf8"))
  : {};
const saveCache = () =>
  writeFileSync(cacheUrl, JSON.stringify(cache, null, 0));

// Build the probe list.
const tasks = [];
for (const cert of CERTS) {
  const subjects = data[cert];
  if (!subjects || typeof subjects !== "object") continue;
  for (const subjectId of Object.keys(subjects)) {
    const yearData = subjects[subjectId]?.[YEAR];
    if (!yearData || typeof yearData !== "object") continue;
    for (const [srcCat, defCat] of [
      ["exampapers", "deferredexams"],
      ["markingschemes", "deferredmarkingschemes"],
    ]) {
      if (Array.isArray(yearData[defCat])) continue; // already populated
      for (const doc of yearData[srcCat] ?? []) {
        tasks.push({
          cert,
          subjectId,
          defCat,
          details: doc.details,
          url: doc.url,
          probe: `https://www.examinations.ie/archive/${defCat}/${YEAR}/${doc.url}`,
        });
      }
    }
  }
}

const todo = tasks.filter((t) => !(t.probe in cache));
console.error(
  `${tasks.length} candidates, ${tasks.length - todo.length} cached, ${todo.length} to probe...`
);

let done = 0;
let unresolved = 0;
for (const task of todo) {
  let resolved = false;
  for (let attempt = 0; attempt < 8 && !resolved; attempt++) {
    try {
      const res = await fetch(task.probe, {
        headers: {
          "User-Agent": UA,
          Referer: "https://www.examinations.ie/",
          Range: "bytes=0-0",
          Accept: "application/pdf,*/*",
        },
      });
      if (res.status === 200 || res.status === 206) {
        cache[task.probe] = "exists";
        resolved = true;
      } else if (res.status === 404) {
        cache[task.probe] = "missing";
        resolved = true;
      } else if (res.status === 429 || res.status >= 500) {
        const ra = Number(res.headers.get("retry-after"));
        const wait = ra ? ra * 1000 : Math.min(2000 * 2 ** attempt, 30000);
        console.error(`  ${res.status} -> backoff ${wait}ms`);
        await sleep(wait);
      } else {
        // Unexpected status; treat as missing-ish but record explicitly.
        cache[task.probe] = "missing";
        resolved = true;
        console.error(`  unexpected ${res.status} for ${task.probe} -> missing`);
      }
    } catch (e) {
      console.error(`  error ${String(e)} -> retry`);
      await sleep(2000 * (attempt + 1));
    }
  }
  if (!resolved) unresolved++;
  done++;
  if (done % 25 === 0) {
    saveCache();
    console.error(`  ${done}/${todo.length} (unresolved so far: ${unresolved})`);
  }
  await sleep(DELAY_MS);
}
saveCache();

const stillUnresolved = tasks.filter((t) => !(t.probe in cache));
if (stillUnresolved.length) {
  console.error(
    `\nINCOMPLETE: ${stillUnresolved.length} URLs still unresolved. Re-run the script to continue (cache is saved).`
  );
}

const found = tasks.filter((t) => cache[t.probe] === "exists");
console.error(`\nFound ${found.length} existing deferred documents.`);

// Group into data.json shape: result[cert][subjectId][defCat] = [{details,url}]
const result = {};
for (const t of found) {
  ((result[t.cert] ??= {})[t.subjectId] ??= {})[t.defCat] ??= [];
  result[t.cert][t.subjectId][t.defCat].push({ details: t.details, url: t.url });
}
writeFileSync(outUrl, JSON.stringify(result, null, 2));

const subNames = data.subNumsToNames ?? {};
for (const cert of Object.keys(result)) {
  for (const subjectId of Object.keys(result[cert])) {
    const r = result[cert][subjectId];
    console.error(
      `  ${cert} ${subNames[subjectId] ?? subjectId}: ${r.deferredexams?.length ?? 0} papers, ${r.deferredmarkingschemes?.length ?? 0} marking schemes`
    );
  }
}
console.error(
  stillUnresolved.length
    ? "\nWrote partial scripts/deferred-2025.json (incomplete — re-run)."
    : "\nComplete. Wrote scripts/deferred-2025.json"
);
