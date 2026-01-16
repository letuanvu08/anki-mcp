/**
 * Strip away HTML formatting and clean up text
 * @param htmlString - HTML string to clean
 * @returns Cleaned plain text
 */
export function cleanWithRegex(htmlString: string): string {
  return htmlString
    // Remove style tags and their content
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    // Replace divs with newlines
    .replace(/<div[^>]*>/g, '\n')
    // Remove all HTML tags
    .replace(/<[^>]+>/g, ' ')
    // Remove anki play tags
    .replace(/\[anki:play:[^\]]+\]/g, '')
    // Convert HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    // Clean up whitespace but preserve newlines
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n');
}

/**
 * Formats the URI to be a proper Anki query
 * @param query - Query string from URI
 * @returns Formatted query string
 */
export function formatQuery(query: string): string {
  if (query.startsWith("deck")) {
    return `deck:${query.slice(4)}`;
  }
  if (query.startsWith("is")) {
    return `is:${query.slice(2)}`;
  }
  return query;
}
