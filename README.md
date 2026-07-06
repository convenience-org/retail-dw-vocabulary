# Generating the JSON-LD Context

The JSON-LD context (`vocabulary.context.jsonld`) is auto-generated from
`vocabulary.yml` using [`yml2vocab`](https://github.com/w3c/yml2vocab).
Do not hand-edit the context file — edit the YAML and regenerate.

## Prerequisites

- Node.js >= 21
- `yml2vocab` cloned as a sibling folder:

```
  parent/
    yml2vocab/
    retail-dw-vocabulary/
```

## Build the tool (one-time)

```bash
cd ../yml2vocab
npm install
# compiles TypeScript to dist/
npm run dist
```

## Generate Context

Run from **retail-dw-vocabulary root** (output files are written to the
current directory):

```bash
node ../yml2vocab/dist/main.js -v vocabulary.yml -t template.html -c
```

Flags: `-v` vocab file, `-t` HTML template, `-c` emit the JSON-LD context.
Add `-d` for a full error stack if it fails.

Outputs: `vocabulary.context.jsonld` (the context), plus `vocabulary.ttl`,
`vocabulary.jsonld`, and `vocabulary.html`.

- `vocabulary.context.jsonld` can be renamed later as `v1rcN.jsonld` where
N is the revision number and put this file under contexts directory.
- `vocabulary.html` — the rendered vocabulary documentation, built from
`template.html`. This is what the repo publishes as `index.html`. If you
want the published docs to reflect new terms, update `index.html` from
the generated output — either copy the contents of `vocabulary.html`
into the existing `index.html`, or delete `index.html` and rename
`vocabulary.html` to `index.html`.

## Adding new terms

Edit `vocabulary.yml` — classes under `class:`, properties under `property:` —
then regenerate. Keep each term's context: value pointing
at the current context version (currently https://w3id.org/retail-dw/v1rc1).
If you cut a new revision, update these to match.

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
