---
title: Building a Camp Snap V105 filter tool
slug: camp-snap-v105-filter-tool
createdAt: "2026-04-21"
keywords: camp snap, camp-snap, filter, flt, photography, image processing
---

I recently bought a Camp Snap V105. The idea of a small screenless camera, cheap looks pe

But when I first used it, I did not really like the photos.

I was expecting something closer to a disposable camera vibe, imperfect, warm washed colors, nostalgic, not technically great, but pleasant. What I got from the default look felt just like a bad digital camera.

After some digging, I found out that the V105 supports custom filters through `.flt` files. That kinda saved the game, but then I hit a different problem: the filters only helped for future photos, what would I do with the ones I already took? (no i won't edit them by hand)

I already had pictures I wanted to fix, and I could not find (or didn't look enough) a tool to apply a Camp Snap filter to photos that were already taken.

So I built one.

The result is a local/offline workbench where you can upload a `.flt` file, add photos, process them and export it.

Not only this, I also added a preview of the before/after result, adjust the RGB curves, export the edited filter.

The tool is here: [/camp-snap](/camp-snap)

## Context

Camp Snap V105 filters are stored as `.flt` files. At first glance, they look like a small config file with some familiar values:

```txt
brightness, contrast, saturation, hue, gammaR, gammaG, gammaB
```

So my first assumption was that the file described the operations needed to recreate the filter, pretty similar to the Camp Snap filter tool.
Something like:

1. adjust brightness
2. adjust contrast
3. adjust saturation
4. adjust hue
5. apply per-channel gamma

But after looking at real files, that model was not enough, so I dug into Camp Snap tool code.

The important part of the file is not the first line. The real filter is the payload after it.

## The file shape

A V105 `.flt` file is plain text. After the first line, it contains exactly `777` numbers.

Those numbers are not arbitrary:

| Section   | Count | Meaning                              |
| --------- | ----: | ------------------------------------ |
| Matrix    |     9 | a 3x3 color matrix, stored row-major |
| Red LUT   |   256 | red channel lookup table             |
| Green LUT |   256 | green channel lookup table           |
| Blue LUT  |   256 | blue channel lookup table            |

The matrix values are stored as fixed-point numbers scaled by `1024`.

E.g.

```txt
1085, -51, -10,
-20, 1055, -10,
-20, -51, 1096
```

becomes:

```txt
R' = (1085R - 51G - 10B) / 1024
G' = (-20R + 1055G - 10B) / 1024
B' = (-20R - 51G + 1096B) / 1024
```

The LUTs are simpler. Each channel has 256 entries, so the current channel value becomes an index into its table:

```txt
red_out = lutR[red_in]
```

This was the first useful discovery: the filter is already baked.

The brightness/contrast/saturation/hue/gamma values are useful metadata for an editor, but they are not the source of truth for rendering. The matrix and LUTs are.

## The rendering pipeline

The second important part was the order of operations.

The pipeline I ended up with is:

1. inverse gamma
2. 3x3 color matrix
3. forward gamma
4. per-channel LUT

In code, the core shape is basically:

```ts
applyInverseGammaTableRGBA(pixels);
applyMatrixRGBAFloat(pixels, filter.matrix);
applyGammaTableRGBA(pixels);
applyPerChannelLUT(pixels, filter.lutR, filter.lutG, filter.lutB);
```

Changing this order makes the output visibly different.

The matrix wants to operate in a more linear space, so it is wrapped between inverse and forward gamma. Then the LUTs are applied at the end, after the values are back in the normal 8-bit encoded space.

The alpha channel is ignored and preserved.

## 8-bit intermediates matter

Another detail that surprised me: keeping more precision is not always "more correct" if the goal is to match a reference pipeline.

The implementation clamps and rounds to 8-bit values between stages. That means the matrix output is written back to bytes before the forward gamma stage reads it.

This matters around highlights and clipping. If a matrix pushes a channel above `255`, it clips before gamma has a chance to compress it.

Using floats all the way through looks reasonable, but it is a different renderer.

## What the tool does

The current tool has a few pieces:

- parses `.flt` files and validates the expected shape
- applies the V105 pipeline to JPEG, PNG, and WebP files locally
- processes batches in a worker when possible
- exports processed photos as PNGs inside a ZIP
- exposes the RGB LUTs as editable curves
- exports a new `.flt` file with the edited LUTs

The curve editor edits the LUTs directly. This matches the mental model I ended up with: once the filter is baked, editing the tone curve means editing the lookup tables, not trying to reverse-engineer the original brightness or contrast slider values.

The matrix is left alone for now. Editing a 3x3 color transform properly deserves a different UI than "here are nine numbers, good luck".

## Final mental model

Camp Snap V105 filters are not small image-processing scripts.

They are precomputed color transforms:

```txt
inverse gamma -> matrix -> gamma -> RGB LUTs
```

The `.flt` file is a snapshot of that transform. The UI values are helpful for humans, but the matrix and LUTs are what actually make the image.

Once I stopped treating the file as instructions and started treating it as data, the tool became much easier to reason about.

## Further looking

The Camp Snap filter tool have a hidden setting: apply grain, but it contains a confusing comment:

```html
<!-- The Grain effect will cause the camera to lag, so it will not be used temporarily. -->
```

This let me think the camera supports grain, however it is not exported in the `.flt` file, it is only applied in the tool. So I assume there is a undocumented setting to enable it.
