# Generating the JSON-LD Context

The JSON-LD context (`vocabulary.context.jsonld`) is auto-generated from
`vocabulary.yml` using [`yml2vocab`](https://github.com/w3c/yml2vocab).
Do not hand-edit the context file — edit the YAML and regenerate.

## Prerequisites

- Node.js >= 21
- Install dependencies (pulls in `yml2vocab` as a devDependency):

```bash
npm install
```

## Usage (Generate Context)

Everything runs through two npm scripts (each one generates, places the files
in their final locations, and cleans up).

**Step 1 — iterate.** After each change to `vocabulary.yml` or `template.html`,
regenerate the draft:

```bash
npm run generate-draft
```

Run it as many times as you like. Each run overwrites the same draft file, so
the already-published context is never touched.

**Step 2 — cut the release candidate.** Once the revision is final, run this
once to publish it (`rc` = release candidate):

```bash
npm run generate-rc
```

It publishes the draft as the final versioned context and deletes the draft.

**Naming.**

- Published contexts live in `contexts/` as `v1rc<N>.jsonld`.
- A draft is named for the version it will *become* — with `v1rc1` published,
`generate-draft` writes `contexts/v1rc2-draft.jsonld`, and `generate-rc`
publishes it as `contexts/v1rc2.jsonld` (dropping `-draft`).

**Example — developing v1rc2 (v1rc1 already published).**

Starting point:

```
# already published
contexts/
  v1rc1.jsonld
```

1. Add terms to `vocabulary.yml`, then run `npm run generate-draft`:

```
contexts/
  v1rc1.jsonld
  # new draft, index.html updated
  v1rc2-draft.jsonld
```

2. Need more changes? Edit `vocabulary.yml` and run `npm run generate-draft`
  again — it overwrites the same `v1rc2-draft.jsonld`. Repeat as needed.

3. Happy with it? Run `npm run generate-rc`:

```
contexts/
  v1rc1.jsonld
  # published (draft removed)
  v1rc2.jsonld
```

The next revision starts the same way: `generate-draft` now produces
`v1rc3-draft.jsonld`.

**Both scripts also** render the docs to `index.html` and delete the unused
`vocabulary.ttl` / `vocabulary.jsonld` outputs.

**Under the hood,** each script runs
`yml2vocab -v vocabulary.yml -t template.html -c` then
`node scripts/postgenerate.js` (with `--rc` for publish). Flags: `-v` vocab
file, `-t` template, `-c` emit the context; add `-d` for a full error stack.

### Manual (without the npm scripts)

If you need to run the tool directly, from the **retail-dw-vocabulary root**:

```bash
npx yml2vocab -v vocabulary.yml -t template.html -c
```

Flags: `-v` vocab file, `-t` HTML template, `-c` emit the JSON-LD context.
Add `-d` for a full error stack if it fails.

This writes raw outputs to the current directory — `vocabulary.context.jsonld`
(the context), plus `vocabulary.ttl`, `vocabulary.jsonld`, and
`vocabulary.html` — and does **not** place them. You then do what the scripts
would otherwise automate:

- Move `vocabulary.context.jsonld` into `contexts/` as `v1rc<N>.jsonld` (the
  revision number).
- Update the published docs from `vocabulary.html`: copy its contents into
  `index.html`, or delete `index.html` and rename `vocabulary.html` to it.
- Delete the unused `vocabulary.ttl` and `vocabulary.jsonld`.

## Adding new terms

Edit `vocabulary.yml` — classes under `class:`, properties under `property:` —
then regenerate. Keep each term's `context:` value pointing at the current
context version (currently https://w3id.org/retail-dw/v1rc1). If you cut a
new revision, update these to match.

## Abstract, introduction, and shortName (template.html)

These are hardcoded directly in `template.html`. `yml2vocab` has no
`dc:abstract` handling and does not process `{{...}}` placeholders, so it
cannot fill them from the YAML. Edit the abstract/introduction/shortName in
`template.html` — never in the generated `index.html`, which is overwritten on
every run.

## Indentation (.editorconfig)

`yml2vocab` pretty-prints the context at **indent size 4** by default. To keep
this repo's context at **2-space** indentation, an `.editorconfig` is included
in the repo root. `yml2vocab` reads it from the directory the command is run in
at generation time, so keep it there and run the command from the repo root.

`.editorconfig`:

```ini
root = true

[*]
indent_style = space
indent_size = 2
```
