/** Pure utility functions for sheet operations — safe for client-side use (no googleapis import). */

/** Extract the spreadsheet ID from a Google Sheets URL. */
export function extractSheetId(url: string): string | null {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match && match[1] ? match[1] : null;
}

/** The canonical column headers for the posts sheet. */
export const SHEET_HEADERS = [
  "post_id",
  "cat1",
  "cat2",
  "title",
  "slug",
  "excerpt",
  "content",
  "tags",
  "likes",
  "comments",
  "view_count",
  "status",
  "featured_image",
  "created_at",
  "last_modified",
] as const;
