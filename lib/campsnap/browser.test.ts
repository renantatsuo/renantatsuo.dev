import {
  CAMP_SNAP_LIMITS,
  createProcessedCampSnapPhotoId,
  validateCampSnapFilterFile,
  validateCampSnapPhotoBatch,
} from "~/lib/campsnap";

describe("Camp Snap browser limits", () => {
  it("rejects filter files larger than the configured limit", () => {
    expect(
      validateCampSnapFilterFile(
        createFile({
          name: "large.flt",
          size: CAMP_SNAP_LIMITS.filterBytes + 1,
        }),
      ),
    ).toBe("Filter files must be 1 MB or smaller.");
  });

  it("rejects photo batches larger than the configured count", () => {
    const files = Array.from(
      { length: CAMP_SNAP_LIMITS.maxPhotoCount + 1 },
      () => createFile({ name: "photo.jpg", size: 1 }),
    );

    expect(validateCampSnapPhotoBatch(files)).toBe(
      "Select 50 photos or fewer.",
    );
  });

  it("rejects source photos larger than the configured size", () => {
    expect(
      validateCampSnapPhotoBatch([
        createFile({
          name: "large.jpg",
          size: CAMP_SNAP_LIMITS.photoBytes + 1,
        }),
      ]),
    ).toBe("Each photo must be 25 MB or smaller.");
  });

  it("accepts photo batches within the configured limits", () => {
    expect(
      validateCampSnapPhotoBatch([
        createFile({
          name: "photo.jpg",
          size: CAMP_SNAP_LIMITS.photoBytes,
        }),
      ]),
    ).toBeUndefined();
  });
});

describe("createProcessedCampSnapPhotoId()", () => {
  it("creates unique IDs even when file metadata matches", () => {
    const file = createFile({
      name: "photo.jpg",
      size: 100,
      lastModified: 123,
    });

    expect(createProcessedCampSnapPhotoId(file)).not.toBe(
      createProcessedCampSnapPhotoId(file),
    );
  });
});

function createFile({
  name,
  size,
  lastModified = 0,
}: {
  name: string;
  size: number;
  lastModified?: number;
}) {
  return {
    name,
    size,
    lastModified,
    type: "image/jpeg",
  } as File;
}
