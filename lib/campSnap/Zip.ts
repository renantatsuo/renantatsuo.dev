const LOCAL_FILE_HEADER_SIGNATURE = 0x04034b50;
const CENTRAL_DIRECTORY_SIGNATURE = 0x02014b50;
const END_OF_CENTRAL_DIRECTORY_SIGNATURE = 0x06054b50;
const VERSION = 20;
const TEXT_ENCODER = new TextEncoder();

export function createZipArchive(files: { name: string; data: Uint8Array }[]) {
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const name = sanitizeFileName(file.name);
    const fileNameBytes = TEXT_ENCODER.encode(name);
    const crc32 = calculateCrc32(file.data);
    const localHeader = new Uint8Array(30 + fileNameBytes.length);
    const localHeaderView = new DataView(localHeader.buffer);

    localHeaderView.setUint32(0, LOCAL_FILE_HEADER_SIGNATURE, true);
    localHeaderView.setUint16(4, VERSION, true);
    localHeaderView.setUint16(6, 0, true);
    localHeaderView.setUint16(8, 0, true);
    localHeaderView.setUint16(10, 0, true);
    localHeaderView.setUint16(12, 0, true);
    localHeaderView.setUint32(14, crc32, true);
    localHeaderView.setUint32(18, file.data.length, true);
    localHeaderView.setUint32(22, file.data.length, true);
    localHeaderView.setUint16(26, fileNameBytes.length, true);
    localHeaderView.setUint16(28, 0, true);
    localHeader.set(fileNameBytes, 30);

    const centralHeader = new Uint8Array(46 + fileNameBytes.length);
    const centralHeaderView = new DataView(centralHeader.buffer);

    centralHeaderView.setUint32(0, CENTRAL_DIRECTORY_SIGNATURE, true);
    centralHeaderView.setUint16(4, VERSION, true);
    centralHeaderView.setUint16(6, VERSION, true);
    centralHeaderView.setUint16(8, 0, true);
    centralHeaderView.setUint16(10, 0, true);
    centralHeaderView.setUint16(12, 0, true);
    centralHeaderView.setUint16(14, 0, true);
    centralHeaderView.setUint32(16, crc32, true);
    centralHeaderView.setUint32(20, file.data.length, true);
    centralHeaderView.setUint32(24, file.data.length, true);
    centralHeaderView.setUint16(28, fileNameBytes.length, true);
    centralHeaderView.setUint16(30, 0, true);
    centralHeaderView.setUint16(32, 0, true);
    centralHeaderView.setUint16(34, 0, true);
    centralHeaderView.setUint16(36, 0, true);
    centralHeaderView.setUint32(38, 0, true);
    centralHeaderView.setUint32(42, offset, true);
    centralHeader.set(fileNameBytes, 46);

    localParts.push(localHeader, file.data);
    centralParts.push(centralHeader);

    offset += localHeader.length + file.data.length;
  }

  const centralDirectorySize = centralParts.reduce(
    (total, part) => total + part.length,
    0,
  );
  const endRecord = new Uint8Array(22);
  const endRecordView = new DataView(endRecord.buffer);

  endRecordView.setUint32(0, END_OF_CENTRAL_DIRECTORY_SIGNATURE, true);
  endRecordView.setUint16(4, 0, true);
  endRecordView.setUint16(6, 0, true);
  endRecordView.setUint16(8, files.length, true);
  endRecordView.setUint16(10, files.length, true);
  endRecordView.setUint32(12, centralDirectorySize, true);
  endRecordView.setUint32(16, offset, true);
  endRecordView.setUint16(20, 0, true);

  return new Blob([...localParts, ...centralParts, endRecord], {
    type: "application/zip",
  });
}

export function sanitizeFileName(name: string) {
  const trimmed = name.trim().toLowerCase();
  const [baseName, extension = "png"] = trimmed.split(/\.(?=[^.]+$)/);
  const safeBaseName = baseName
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
  const safeExtension = extension.replace(/[^a-z0-9]+/g, "").slice(0, 10);

  if (!safeBaseName) {
    return `processed.${safeExtension || "png"}`;
  }

  return `${safeBaseName}.${safeExtension || "png"}`;
}

const CRC_TABLE = createCrcTable();

function calculateCrc32(data: Uint8Array) {
  let crc = 0xffffffff;

  for (const byte of data) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ byte) & 0xff];
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function createCrcTable() {
  return Array.from({ length: 256 }, (_, index) => {
    let current = index;

    for (let bit = 0; bit < 8; bit += 1) {
      current =
        (current & 1) === 1 ? 0xedb88320 ^ (current >>> 1) : current >>> 1;
    }

    return current >>> 0;
  });
}
