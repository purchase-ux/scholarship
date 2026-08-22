// Shared between the browser (pre-upload check) and the server (signed-URL
// creation) — a browser-supplied File.type or filename extension is just
// metadata the client asserts, so both sides sniff the actual file signature
// instead of trusting either.

export const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

export const GENERIC_UPLOAD_ERROR =
  "We couldn't upload your documents. Please check your files and try again.";
export const INVALID_FILE_CONTENT_ERROR =
  "One of your files doesn't look like a valid PDF, JPG, or PNG. Please check it and try again.";
export const HEIC_FILE_CONTENT_ERROR =
  "One of your files is an iPhone HEIC photo, which isn't supported. On your iPhone, go to Settings > Camera > Formats and choose \"Most Compatible\", then retake the photo — or share/export it as a JPG first.";

const HEIC_BRANDS = ["heic", "heix", "hevc", "heim", "heis", "hevm", "hevs", "mif1", "msf1"];

export type DetectedFileType =
  | { mime: "application/pdf"; ext: "pdf" }
  | { mime: "image/jpeg"; ext: "jpg" }
  | { mime: "image/png"; ext: "png" };

export async function detectRealFileType(
  file: File
): Promise<DetectedFileType | null | "heic"> {
  const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (header[0] === 0x25 && header[1] === 0x50 && header[2] === 0x44 && header[3] === 0x46) {
    return { mime: "application/pdf", ext: "pdf" }; // %PDF
  }
  if (header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff) {
    return { mime: "image/jpeg", ext: "jpg" };
  }
  if (
    header[0] === 0x89 &&
    header[1] === 0x50 &&
    header[2] === 0x4e &&
    header[3] === 0x47 &&
    header[4] === 0x0d &&
    header[5] === 0x0a &&
    header[6] === 0x1a &&
    header[7] === 0x0a
  ) {
    return { mime: "image/png", ext: "png" };
  }
  // HEIC/HEIF (ISOBMFF container): bytes 4-7 spell "ftyp", bytes 8-11 are a
  // brand code identifying the format — this is what an unconverted iPhone
  // photo actually looks like on the wire, regardless of what Content-Type
  // or filename the client sent.
  const brand = String.fromCharCode(header[8], header[9], header[10], header[11]);
  if (
    header[4] === 0x66 &&
    header[5] === 0x74 &&
    header[6] === 0x79 &&
    header[7] === 0x70 &&
    HEIC_BRANDS.includes(brand)
  ) {
    return "heic";
  }
  return null;
}
