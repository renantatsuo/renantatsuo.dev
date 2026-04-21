# Camp Snap V105 `.flt` Filter — Format and Pipeline Specification

This document specifies the Camp Snap V105 `.flt` filter format and the
rendering pipeline that consumes it, independently of any particular
implementation. It aims to be the document a new consumer reads when writing
a reader, renderer, or test harness from scratch.

## Scope and non-goals

In scope:

- The on-disk layout of `.flt` files.
- The data model a consumer must materialize from a `.flt`.
- The sequence and per-stage semantics of the rendering pipeline.
- Invariants any conformant consumer must preserve.

Out of scope:

- Bit-exact parity with Camp Snap camera firmware or the Camp Snap web tool.
  The authoritative behavior of those systems is not publicly documented and
  is not reproduced here.
- Grain, dithering, or any stochastic post-processing. These are runtime
  effects applied on top of the deterministic pipeline and are not carried
  in the file.
- Discovery, storage, or UI concerns (file pickers, previews, slider
  presentation, etc.).

## Provenance and authority

This specification is derived from inspecting real `.flt` files and the
pipeline used by the Camp Snap web tool. It is not issued by Camp Snap.
Treat it as a behavioral spec of the file format as observed, plus a
documented convention for the pipeline shape. Where the real firmware or web
tool may differ in numeric detail (notably the gamma curve), this is called
out explicitly.

## 1. File format

### 1.1 Physical layout

A `.flt` file is plain text, UTF-8 encoded, line-oriented. After trimming
whitespace from each line and discarding blank lines, a conformant file
contains exactly two logical sections:

| Logical line | Contents                                   |
| ------------ | ------------------------------------------ |
| 0            | 7 comma-separated floats (UI parameters)   |
| 1+           | A flat comma-separated list of 777 numbers |

The payload is a single logical sequence of 777 numbers. It may be split
across any number of physical lines. The convention used by Camp Snap tools
is one physical line per matrix row (three lines) and one physical line per
LUT (three lines), for six lines of payload, but this layout is not
required.

### 1.2 Payload order

The 777 payload values are consumed strictly in this order:

1. 9 matrix values, row-major (indices 0–8).
2. 256 red-channel LUT values (indices 9–264).
3. 256 green-channel LUT values (indices 265–520).
4. 256 blue-channel LUT values (indices 521–776).

No framing, length prefixes, or separators distinguish these sections; the
counts are fixed by this spec.

### 1.3 Parsing tolerances

A conformant parser must accept:

- Line endings of `LF` or `CRLF`.
- Leading and trailing whitespace on any line.
- Blank lines anywhere in the file.
- Whitespace around values, including spaces following commas.
- A trailing comma after the final value of any line.
- A trailing newline at end of file.

A conformant parser must reject:

- A file with fewer than two non-empty lines.
- A line 0 that does not contain exactly 7 parseable floats.
- A payload whose total count of numeric tokens is not exactly 777.
- Any non-numeric token in the payload or in line 0. Comments are not
  supported.

Rejection should produce no partial result. The specific error messages are
implementation-defined.

### 1.4 Line 0: UI parameters

Line 0 carries seven floats, conventionally labelled:

```txt
brightness, contrast, saturation, hue, gammaR, gammaG, gammaB
```

These values are **informational only**. They correspond to the sliders
used to author the filter and are useful for re-populating an editing UI.
They are **not** inputs to the rendering pipeline: the matrix and LUTs in
the payload are the authoritative rendering data, and a consumer must not
attempt to reconstruct them from the parameters.

The format does not constrain parameter ranges or units. A consumer should
treat them as opaque metadata unless it has external knowledge of the
authoring tool's expected ranges.

## 2. Data model

A parsed `.flt` produces the following values:

- Seven UI parameters, as floats: `brightness`, `contrast`, `saturation`,
  `hue`, `gammaR`, `gammaG`, `gammaB`.
- A 3×3 matrix of integers, stored row-major, fixed-point scaled by 1024.
  Call this `matrix1024`.
- Three independent 256-entry lookup tables of integers in the range
  `[0, 255]`: `lutR`, `lutG`, `lutB`.

The runtime matrix used for rendering is `matrix1024` with each entry
divided by 1024. A consumer that re-serializes a filter must round-trip
through the integer form; a consumer that renders must use the float form.

### 2.1 Matrix

Example stored form:

```txt
1085, -51, -10,
-20, 1055, -10,
-20, -51, 1096
```

Interpreted as row-major, this yields:

```txt
R' = (m00·R + m01·G + m02·B) / 1024
G' = (m10·R + m11·G + m12·B) / 1024
B' = (m20·R + m21·G + m22·B) / 1024
```

The matrix is a general linear RGB transform. In typical Camp Snap filters
it encodes saturation and hue adjustments, but the format does not restrict
its meaning; a consumer must treat any 3×3 of stored integers as valid.
Negative entries are common.

### 2.2 LUTs

Each LUT is 256 integer entries, each representing an 8-bit output value for
the corresponding 8-bit input:

```txt
channel_out = lut[channel_in]
```

The format does not require LUTs to be monotonic. Most filters produced by
Camp Snap tooling are effectively monotonic and encode contrast, black
level, highlight rolloff, and per-channel tone bias, but non-monotonic
tables are permitted by the format and should be applied as-is (they would
produce unusual effects such as solarization). Consumers must not
normalize, smooth, or clamp entries to enforce monotonicity.

LUT entries are stored as integers in the payload. In-range entries are
`[0, 255]`; a consumer should clamp defensively when applying them.

## 3. Rendering pipeline

A conformant renderer applies four stages, in this order, to each RGB
triple of the input image:

1. **Inverse gamma**, per channel, bringing gamma-encoded input into a
   pseudo-linear working space.
2. **3×3 color matrix**, using the runtime (`/ 1024`) matrix, producing
   pseudo-linear output.
3. **Forward gamma**, per channel, re-encoding the matrix output into
   gamma-encoded space.
4. **Per-channel LUT**, applying `lutR`, `lutG`, and `lutB` to the
   respective channels.

This order is fixed. Reordering produces visibly different output and is
non-conformant. The alpha channel is passed through unchanged at every
stage.

### 3.1 Intermediate representation

The pipeline is defined over 8-bit-per-channel RGB with a single byte of
alpha (RGBA8888). The expected intermediate representation between stages
is also 8-bit per channel. In particular:

- After the matrix stage, each channel is rounded and clamped to
  `[0, 255]` before the forward gamma stage reads it.
- After the forward gamma stage, each channel is an integer in `[0, 255]`
  used directly as an index into the per-channel LUT.

Carrying higher precision between stages produces output that diverges
from the reference pipeline, particularly in highlights (where matrix
overshoot clips to 255 before the forward gamma would have compressed it).
Consumers that want bit-parity with the reference must use 8-bit
intermediates.

Renderers that knowingly want higher fidelity (e.g. for print output) may
carry more precision between stages, but must document that they diverge
from the reference pipeline.

### 3.2 Clamping

Every stage that writes a channel byte must clamp its result to `[0, 255]`
and round to the nearest integer before writing.

### 3.3 Alpha

The alpha channel is never read by any stage and is never written by any
stage. An image with a non-opaque alpha channel must emerge with the same
alpha channel it had on input.

## 4. Gamma curves

This is the part of the pipeline that the `.flt` file does not pin down.

The `.flt` format carries **no gamma data**. The matrix is bracketed by two
gamma stages purely as a pipeline shape: apply an inverse transform, operate
linearly, apply the forward transform. The choice of curve is not in the
file.

Two compatible consumers of the same `.flt` will produce different pixel
output if they use different gamma curves, even though both are
"conformant" to the file format. This is a real source of drift and should
be treated as a version negotiation between consumers, not an implementation
detail.

### 4.1 Conventional curve

The conventional choice, and the one used by this repository, is the
standard sRGB piecewise curve:

```txt
inverse (encoded → linear):
  c <= 0.04045      → c / 12.92
  otherwise         → ((c + 0.055) / 1.055) ** 2.4

forward (linear → encoded):
  c <= 0.0031308    → c * 12.92
  otherwise         → 1.055 * c ** (1 / 2.4) - 0.055
```

Both curves are sampled into 256-entry byte tables keyed by an 8-bit input
value, so a channel passes through exactly one table lookup per stage. The
same table is used for all three channels; the per-channel `gammaR`,
`gammaG`, `gammaB` parameters from line 0 do **not** feed into the curve.

Note that replacing the piecewise form with a pure power curve such as
`x ** 2.2` is not equivalent; the toe region matters for dark values.

### 4.2 Firmware curve

The actual on-camera Camp Snap gamma curve is not publicly documented here.
A consumer aiming for bit-exact parity with camera output must source that
curve elsewhere and is outside the scope of this spec.

### 4.3 Round-trip

Inverse gamma followed by forward gamma is not exactly the identity when
the curves are quantized to 8-bit tables. A small number of input values
shift by one count. This is expected.

## 5. Determinism and conformance

### 5.1 Determinism

The pipeline is fully deterministic. Given the same input RGBA image and
the same `.flt` contents, a conformant renderer produces the same output
image on every invocation. There are no stochastic effects in the pipeline.

### 5.2 Grain and other post-processing

Grain, dither, vignette, and similar effects are not part of the `.flt`
format and not part of this specification. A consumer application may
layer them on top of the deterministic pipeline output, but they are not
part of the filter's identity and must not be persisted as part of the
filter data.

### 5.3 Summary of invariants

A conformant reader:

- Produces exactly seven UI parameters and exactly 777 payload numbers, or
  rejects the file.
- Does not reorder or reshape the payload.

A conformant renderer:

- Applies the four stages in the fixed order.
- Preserves the alpha channel unchanged.
- Clamps and rounds to 8-bit at every stage boundary.
- Uses the baked matrix and LUTs, not the UI parameters, for rendering.

## 6. Known ambiguities

These are areas where this spec does not pin down behavior and where
independent implementations may diverge:

- **Gamma curve.** The `.flt` file carries no gamma data. Implementations
  must agree on a curve to produce identical output. sRGB piecewise is the
  documented convention.
- **Precision between stages.** The reference pipeline uses 8-bit
  intermediates. Higher-precision implementations will produce different
  results in the extremes.
- **LUT monotonicity.** The format permits non-monotonic LUTs. Real-world
  filters are almost always monotonic; tooling that assumes this must
  document the assumption.
- **Out-of-range stored values.** The format does not forbid matrix
  entries that push pseudo-linear intermediates outside `[0, 255]`, or LUT
  entries outside `[0, 255]`. Conformant renderers clamp; they do not
  reject.
- **Parameter ranges.** The seven line-0 parameters have no format-level
  ranges. UI consumers that show them must source ranges externally.

## 7. Mental model

Camp Snap V105 filters are not algorithms. They are precomputed color
transforms, expressed as a 3×3 matrix and three 256-entry LUTs, applied in
a fixed four-stage pipeline over an 8-bit RGBA buffer. The `.flt` file is
a baked snapshot of that transform. The UI parameters alongside are
metadata about how it was authored, not inputs to how it renders.
