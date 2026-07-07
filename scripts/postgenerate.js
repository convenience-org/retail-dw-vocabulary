#!/usr/bin/env node
// Places yml2vocab outputs into their published locations.
//
// (overwrite the draft)
// generate-draft -> contexts/v1rc<next>-draft.jsonld
//
// (publish, drop -draft)
// generate-rc -> contexts/v1rc<next>.jsonld
//
// <next> = <highest published v1rc<N>.jsonld> + 1. The draft is named for the
// version it will BECOME (e.g. with v1rc1 published, the draft is v1rc2-draft,
// and generate release candidates publishes v1rc2). Draft files never count
// toward the highest.
//
// vocabulary.html -> index.html in both modes. The unused vocabulary.ttl and
// vocabulary.jsonld outputs (always emitted by yml2vocab) are deleted.

import {
  readdirSync,
  renameSync,
  existsSync,
  mkdirSync,
  rmSync } from 'node:fs';
import { join } from 'node:path';

const rc = process.argv.includes('--rc');
const contextsDir = 'contexts';
const generatedContext = 'vocabulary.context.jsonld';
const generatedHtml = 'vocabulary.html';

if (!existsSync(contextsDir)) {
  mkdirSync(contextsDir);
}

// highest PUBLISHED revision (unsuffixed only; drafts ignored)
const highest = readdirSync(contextsDir)
  .map(f => f.match(/^v1rc(\d+)\.jsonld$/))
  .filter(Boolean)
  .map(m => parseInt(m[1], 10))
  .reduce((max, n) => Math.max(max, n), 0);

// the version the draft targets / rc publishes
const next = highest + 1;

if (!existsSync(generatedContext)) {
  console.error(
    `Error: ${generatedContext} not found. Generation must run first.`);
  process.exit(1);
}

if (rc) {
  const targetFile = join(contextsDir, `v1rc${next}.jsonld`);
  renameSync(generatedContext, targetFile);
  // remove the draft for the revision we just published, if present
  const draft = join(contextsDir, `v1rc${next}-draft.jsonld`);

  if (existsSync(draft)) {
    rmSync(draft);
    console.log(`removed draft -> ${draft}`); 
  }
  console.log(`published -> ${targetFile}`);
} else {
  const targetFile = join(contextsDir, `v1rc${next}-draft.jsonld`);
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
    console.log(`removed  -> ${f}`);
  }
}