import { createZipArchive, sanitizeFileName } from "~/lib/campSnap";

describe("sanitizeFileName()", () => {
  it("normalizes names to safe zip entries", () => {
    expect(sanitizeFileName("My Photo -- Disposable!.PNG")).toBe(
      "my-photo-disposable.png",
    );
  });

  it("falls back when the base name is empty", () => {
    expect(sanitizeFileName("   .png")).toBe("processed.png");
  });
});

describe("createZipArchive()", () => {
  it("creates a valid zip blob with local and central directory records", async () => {
    const archive = createZipArchive([
      {
        name: "photo.png",
        data: new Uint8Array([1, 2, 3, 4]),
      },
    ]);
    const bytes = new Uint8Array(await archive.arrayBuffer());
    const view = new DataView(bytes.buffer);

    expect(view.getUint32(0, true)).toBe(0x04034b50);
    expect(bytes.includes(0x50)).toBe(true);
    expect(view.getUint32(bytes.length - 22, true)).toBe(0x06054b50);
  });
});
