
export function assignPremioImage(
  file?: Express.Multer.File,
  defaultUrl?: string
): string {
  if (file) {
    return `/uploads/${file.filename}`;
  }
  return defaultUrl || '';
}
