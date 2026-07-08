#!/usr/bin/env node
// Places yml2vocab outputs into their published locations.
//
// (overwrite the draft)
// generate-draft -> contexts/v<major>rc<next>-draft.jsonld
//
// (publish the release candidate, drop -draft)
// generate-rc -> contexts/v<major>rc<next>.jsonld
//
// (start the next major; rc resets to 1)
// generate-major -> contexts/v<major+1>rc1.jsonld
//
// generate-draft and generate-rc work on the HIGHEST existing major and only
// increment the rc.
//
// generate-major is the only mode that advances the major, resetting rc to 1.
// With nothing published yet, the target is v1rc1.

// The draft is named for the version it will BECOME (e.g. with v1rc1 published,
// the draft is v1rc2-draft, and generate-rc publishes v1rc2). Draft files never
// count toward the highest.
//
// vocabulary.html -> index.html in all modes. The unused vocabulary.ttl and
// vocabulary.jsonld outputs (always emitted by yml2vocab) are deleted.

import {
  readdirSync,
  renameSync,
  existsSync,
  mkdirSync,
  rmSync } from 'node:fs';
import { join } from 'node:path';

const rc = process.argv.includes('--rc');
const major = process.argv.includes('--major');
const contextsDir = 'contexts';
const generatedContext = 'vocabulary.context.jsonld';
const generatedHtml = 'vocabulary.html';

if (rc && major) {
  console.error('Error: pass only one of --rc or --major, not both.');
  process.exit(1);
}

if (!existsSync(contextsDir)) {
  mkdirSync(contextsDir);
}

// all PUBLISHED versions (unsuffixed only; drafts ignored) as [major, rc] pairs
const versions = readdirSync(contextsDir)
  .map(f => f.match(/^v(\d+)rc(\d+)\.jsonld$/))
  .filter(Boolean)
  .map(m => [parseInt(m[1], 10), parseInt(m[2], 10)]);

// highest published [major, rc] (major dominates); [0, 0] if nothing published
const [curMajor, curRc] = versions
  .reduce(([hM, hR], [m, r]) =>
    (m > hM || (m === hM && r > hR)) ? [m, r] : [hM, hR], [0, 0]);

// decide the target [major, rc]
let tMajor, tRc;
if (major) {
  // next major, rc resets to 1 (or v1rc1 if nothing published yet)
  tMajor = curMajor === 0 ? 1 : curMajor + 1;
  tRc = 1;
} else {
  // same major, next rc (or v1rc1 if nothing published yet)
  tMajor = curMajor === 0 ? 1 : curMajor;
  tRc = curMajor === 0 ? 1 : curRc + 1;
}

const stem = `v${tMajor}rc${tRc}`;

if (!existsSync(generatedContext)) {
  console.error(
    `Error: ${generatedContext} not found. Generation must run first.`);
  process.exit(1);
}

const publish = rc || major;

if (publish) {
  const targetFile = join(contextsDir, `${stem}.jsonld`);
  renameSync(generatedContext, targetFile);
  // remove the draft for the revision we just published, if present
  const draft = join(contextsDir, `${stem}-draft.jsonld`);

  if (existsSync(draft)) {
    rmSync(draft);
    console.log(`removed draft -> ${draft}`);
  }
  console.log(`published -> ${targetFile}`);
} else {
  const targetFile = join(contextsDir, `${stem}-draft.jsonld`);
  renameSync(generatedContext, targetFile);
  console.log(`draft -> ${targetFile}`);
}

if (existsSync(generatedHtml)) {
  renameSync(generatedHtml, 'index.html');
  console.log('Updates (if any) to index.html');
}

// Remove generated outputs the repo doesn't track
// (yml2vocab always emits these)
for (const f of ['vocabulary.ttl', 'vocabulary.jsonld']) {
  if (existsSync(f)) {
    rmSync(f);
    console.log(`removed -> ${f}`);
  }
}
