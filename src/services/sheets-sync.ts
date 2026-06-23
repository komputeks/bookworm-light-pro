/**
 * Google Sheets sync service — the core bi-directional sync engine.
 * Uses the service account (server-side only) to access user-shared spreadsheets.
 *
 * Sheet column order (frozen header row):
 * post_id | cat1 | cat2 | title | slug | excerpt | content | tags | likes |
 * comments | view_count | status | featured_image | created_at | last_modified
 */
import { google, type sheets_v4 } from "googleapis";
import { env, isSheetsConfigured } from "@config/env";
import { log, withRetry } from "@lib/errors";
import type { Post } from "@types";

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

/** Columns that are author-editable (sync both ways, latest wins). */
const AUTHOR_EDITABLE = ["cat1", "cat2", "title", "slug", "excerpt", "content", "tags", "status", "featured_image"];

/** Columns that are system-managed (Supabase→Sheet only; Sheet edits ignored). */
const SYSTEM_MANAGED = ["likes", "comments", "view_count"];

/** Create an authenticated Google Sheets + Drive client using the service account. */
function createGoogleClient(): { sheets: sheets_v4.Sheets; drive: any } {
  if (!isSheetsConfigured) {
    throw new Error("Google Sheets sync is not configured — missing service account credentials.");
  }
  const privateKey = env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, "\n");
  const auth = new google.auth.JWT({
    email: env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL,
    key: privateKey,
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive",
    ],
  });
  return { sheets: google.sheets({ version: "v4", auth }), drive: google.drive({ version: "v3", auth }) };
}

/** Extract the spreadsheet ID from a Google Sheets URL. */
export function extractSheetId(url: string): string | null {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match && match[1] ? match[1] : null;
}

/** Convert a Post object to a row array matching SHEET_HEADERS order. */
function postToRow(post: Post): (string | number)[] {
  return [
    post.id,
    post.cat1,
    post.cat2,
    post.title,
    post.slug,
    post.excerpt ?? "",
    post.content_md,
    post.tags.join(", "),
    post.likes,
    0, // comment count placeholder — updated during sync
    post.view_count,
    post.status,
    post.featured_image ?? "",
    post.created_at,
    post.updated_at,
  ];
}

/** Convert a sheet row array to a partial post object (for Sheets→Supabase sync). */
function rowToPost(row: any[]): Record<string, any> {
  const obj: Record<string, any> = {};
  SHEET_HEADERS.forEach((header, i) => {
    obj[header] = row[i] ?? "";
  });
  return {
    post_id: obj.post_id,
    cat1: String(obj.cat1 || ""),
    cat2: String(obj.cat2 || ""),
    title: String(obj.title || ""),
    slug: String(obj.slug || ""),
    excerpt: String(obj.excerpt || ""),
    content_md: String(obj.content || ""),
    tags: String(obj.tags || "").split(",").map((t: string) => t.trim()).filter(Boolean),
    status: String(obj.status || "draft"),
    featured_image: String(obj.featured_image || ""),
    last_modified: String(obj.last_modified || ""),
  };
}

/**
 * Initialize a user's spreadsheet: verify access, rename, write headers + sample row.
 * Called when the user clicks "Initialize Sheet" after sharing with the service account.
 */
export async function initializeSheet(
  sheetId: string,
  username: string,
  siteName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { sheets, drive } = createGoogleClient();

    // 1. Verify the service account can access the sheet
    const meta = await withRetry(() =>
      sheets.spreadsheets.get({ spreadsheetId: sheetId })
    );
    if (!meta.data) {
      return { success: false, error: "Cannot access spreadsheet. Make sure you shared it with the service account as Editor." };
    }

    // 2. Rename the spreadsheet
    const newName = `${username} — ${siteName} Posts`;
    await withRetry(() =>
      drive.files.update({ fileId: sheetId, requestBody: { name: newName } })
    );

    // 3. Get the first sheet tab
    const sheetTab = meta.data.sheets?.[0];
    const sheetTitle = sheetTab?.properties?.title ?? "Sheet1";

    // 4. Write header row
    await withRetry(() =>
      sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `A1:O1`,
        valueInputOption: "RAW",
        requestBody: { values: [SHEET_HEADERS as unknown as string[]] },
      })
    );

    // 5. Write a sample row
    const sampleRow = [
      "sample-post-id",
      "technology",
      "web-development",
      "My First Post",
      "my-first-post",
      "This is a sample post excerpt.",
      "# My First Post\n\nWrite your markdown content here.",
      "tutorial, beginner",
      0,
      0,
      0,
      "draft",
      "",
      new Date().toISOString(),
      new Date().toISOString(),
    ];
    await withRetry(() =>
      sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `A2:O2`,
        valueInputOption: "RAW",
        requestBody: { values: [sampleRow] },
      })
    );

    // 6. Freeze the header row
    await withRetry(() =>
      sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: {
          requests: [
            {
              updateSheetProperties: {
                properties: { sheetId: sheetTab?.properties?.sheetId, gridProperties: { frozenRowCount: 1 } },
                fields: "gridProperties.frozenRowCount",
              },
            },
            // Bold the header row
            {
              repeatCell: {
                range: { sheetId: sheetTab?.properties?.sheetId, startRowIndex: 0, endRowIndex: 1 },
                cell: { userEnteredFormat: { textFormat: { bold: true } } },
                fields: "userEnteredFormat.textFormat.bold",
              },
            },
          ],
        },
      })
    );

    log({ level: "info", message: "Sheet initialized successfully", context: { sheetId, username } });
    return { success: true };
  } catch (e: any) {
    log({ level: "error", message: "Sheet initialization failed", context: { sheetId }, error: e });
    return { success: false, error: e.message ?? "Unknown error during sheet initialization" };
  }
}

/**
 * Push a single post to the user's sheet (Supabase → Sheets).
 * If the post has a sheet_row_id, update that row. Otherwise, append a new row.
 */
export async function pushPostToSheet(sheetId: string, post: Post): Promise<number | null> {
  try {
    const { sheets } = createGoogleClient();
    const rowData = postToRow(post);

    if (post.sheet_row_id && post.sheet_row_id > 1) {
      // Update existing row
      const rowNumber = post.sheet_row_id;
      await withRetry(() =>
        sheets.spreadsheets.values.update({
          spreadsheetId: sheetId,
          range: `A${rowNumber}:O${rowNumber}`,
          valueInputOption: "RAW",
          requestBody: { values: [rowData as unknown as string[]] },
        })
      );
      return post.sheet_row_id;
    } else {
      // Append new row
      const res = await withRetry(() =>
        sheets.spreadsheets.values.append({
          spreadsheetId: sheetId,
          range: "A2",
          valueInputOption: "RAW",
          insertDataOption: "INSERT_ROWS",
          requestBody: { values: [rowData as unknown as string[]] },
        })
      );
      const newRange = res.data.updates?.updatedRange ?? "";
      const rowMatch = newRange.match(/A(\d+):/);
      return rowMatch && rowMatch[1] ? parseInt(rowMatch[1], 10) : null;
    }
  } catch (e: any) {
    log({ level: "error", message: "pushPostToSheet failed", context: { sheetId, postId: post.id }, error: e });
    return null;
  }
}

/** Delete a post row from the sheet (Supabase → Sheets). */
export async function deletePostFromSheet(sheetId: string, sheetRowId: number | null): Promise<void> {
  if (!sheetRowId || sheetRowId < 2) return;
  try {
    const { sheets } = createGoogleClient();
    // Clear the row values (don't delete the row to avoid shifting row IDs)
    await withRetry(() =>
      sheets.spreadsheets.values.clear({
        spreadsheetId: sheetId,
        range: `A${sheetRowId}:O${sheetRowId}`,
      })
    );
  } catch (e: any) {
    log({ level: "error", message: "deletePostFromSheet failed", context: { sheetId, sheetRowId }, error: e });
  }
}

/**
 * Pull all rows from the sheet and return them as post-like objects (Sheets → Supabase).
 * Only returns rows with a valid post_id.
 */
export async function pullPostsFromSheet(
  sheetId: string
): Promise<{ posts: Record<string, any>[]; error?: string }> {
  try {
    const { sheets } = createGoogleClient();
    const res = await withRetry(() =>
      sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: "A2:O",
      })
    );
    const rows = res.data.values ?? [];
    const posts = rows
      .filter((row) => row[0] && row[0] !== "sample-post-id" && row[0].trim())
      .map((row, i) => ({ ...rowToPost(row), _sheet_row_id: i + 2 }));
    return { posts };
  } catch (e: any) {
    log({ level: "error", message: "pullPostsFromSheet failed", context: { sheetId }, error: e });
    return { posts: [], error: e.message };
  }
}

/**
 * Register a Google Drive Push Notification watch for a spreadsheet.
 * Returns channel ID and expiry. Must be renewed before expiry (~24h).
 */
export async function registerDriveWatch(
  sheetId: string,
  webhookUrl: string
): Promise<{ channelId: string; expiry: string } | null> {
  try {
    const { drive } = createGoogleClient();
    const channelId = `bookworm-${sheetId}-${Date.now()}`;
    const res = await withRetry(() =>
      drive.files.watch({
        fileId: sheetId,
        requestBody: {
          id: channelId,
          type: "web_hook",
          address: webhookUrl,
        },
      })
    );
    const expiryMs = parseInt((res as any)?.data?.expiration ?? "0", 10);
    const expiry = expiryMs > 0 ? new Date(expiryMs).toISOString() : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    log({ level: "info", message: "Drive watch registered", context: { sheetId, channelId, expiry } });
    return { channelId, expiry };
  } catch (e: any) {
    log({ level: "error", message: "registerDriveWatch failed", context: { sheetId }, error: e });
    return null;
  }
}

/** Stop a Drive Push Notification watch channel. */
export async function stopDriveWatch(channelId: string, resourceId: string): Promise<void> {
  try {
    const { drive } = createGoogleClient();
    await drive.channels.stop({
      requestBody: { id: channelId, resourceId },
    });
  } catch (e: any) {
    log({ level: "warn", message: "stopDriveWatch failed", context: { channelId }, error: e });
  }
}

export { AUTHOR_EDITABLE, SYSTEM_MANAGED };
