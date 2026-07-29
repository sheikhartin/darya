/**
 * Darya conversation export: Markdown and plain-text transcript downloads.
 *
 * Provides two export formats:
 *   - Markdown (.md): Rich text with bold labels, italic timestamps, and
 *     a front-matter header. Ideal for viewing in a Markdown renderer.
 *   - Plain text (.txt): Simple labeled entries with timestamp prefixes.
 *     Universally readable in any text editor.
 *
 * Nearly standalone -- reads transcript and lang from the shared DaryaUI
 * namespace (set by core.js), and exposes functions called by app.js.
 * Both exports are no-ops (silently return) when there is no active
 * language or no transcript content, preventing blank downloads.
 *
 * File naming convention: darya-chat-{language-code}-{ISO-timestamp}.{ext}
 */
(function (global) {
  'use strict';

  /**
   * Formats a date using the active language's locale for human-readable
   * export headers. Falls back to ISO-8601 if the Intl API fails or no
   * language is active (e.g., exported before conversation starts).
   * @param {Date} date - The date to format
   * @returns {string} Locale-formatted date-time string
   */
  function formatLocalizedDateTime(date) {
    const lang = global.DaryaUI ? global.DaryaUI.state.lang : null;
    if (!lang) return date.toISOString();
    try {
      return new Intl.DateTimeFormat(lang.ui.dateLocale, {
        dateStyle: 'full', timeStyle: 'short',
      }).format(date);
    } catch (error) {
      return date.toISOString();
    }
  }

  /**
   * Builds the header section used in both Markdown and plain-text exports.
   * Contains the localized date-time at export time.
   * @returns {string} The formatted header line
   */
  function buildExportHeader() {
    const lines = [];
    lines.push(formatLocalizedDateTime(new Date()));
    return lines.join('\n');
  }

  /**
   * Builds a Markdown-formatted transcript of the entire conversation.
   * Each message is wrapped in bold labels with italic timestamps,
   * separated by blank lines for readability. The header includes
   * the export title and localized date.
   * @returns {string} Complete Markdown transcript
   */
  function buildMarkdownTranscript() {
    const ui = global.DaryaUI;
    const lang = ui.state.lang;
    const transcript = ui.state.transcript;
    const header = buildExportHeader();
    const lines = [`# ${lang.ui.exportTitle}`, '', header, '', '---', ''];
    for (const entry of transcript) {
      const label = entry.sender === 'user' ? lang.ui.exportYouLabel : lang.botName;
      lines.push(`**${label}** _(${entry.time})_`);
      lines.push('');
      lines.push(entry.text);
      lines.push('');
    }
    return lines.join('\n');
  }

  /**
   * Builds a plain-text transcript of the entire conversation.
   * Uses a simple "Label (HH:MM):" prefix for each message with a
   * divider line separating the header from the conversation body.
   * @returns {string} Complete plain-text transcript
   */
  function buildPlainTextTranscript() {
    const ui = global.DaryaUI;
    const lang = ui.state.lang;
    const transcript = ui.state.transcript;
    const header = buildExportHeader();
    const lines = [lang.ui.exportTitle, '', header, '', lang.ui.exportDivider, ''];
    for (const entry of transcript) {
      const label = entry.sender === 'user' ? lang.ui.exportYouLabel : lang.botName;
      lines.push(`${label} (${entry.time}):`);
      lines.push(entry.text);
      lines.push('');
    }
    return lines.join('\n');
  }

  /**
   * Triggers a file download in the browser by creating a temporary anchor
   * element with a Blob URL. The URL is revoked with URL.revokeObjectURL
   * immediately after the click to free memory. Works in all modern browsers
   * and most mobile browsers.
   * @param {string} filename - Download filename (e.g., "darya-chat-en-2025-03-15.md")
   * @param {string} content - Text content to write to the file
   * @param {string} mimeType - MIME type ("text/markdown" or "text/plain")
   */
  function downloadTextFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Returns a compact ISO-8601 timestamp string safe for use in filenames.
   * Replaces colons and 'T' separators with hyphens for cross-platform
   * filename compatibility.
   * @returns {string} e.g., "2025-03-15-14-30"
   */
  function exportTimestamp() {
    return new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
  }

  /**
   * Exports the conversation transcript as a Markdown file.
   * No-op if there is no active language or no transcript content.
   * Triggers a browser file download with a descriptive filename.
   */
  function exportMarkdown() {
    const ui = global.DaryaUI;
    if (!ui.state.lang || ui.state.transcript.length === 0) return;
    downloadTextFile(
      `darya-chat-${ui.state.lang.code}-${exportTimestamp()}.md`,
      buildMarkdownTranscript(),
      'text/markdown'
    );
  }

  /**
   * Exports the conversation transcript as a plain text file.
   * No-op if there is no active language or no transcript content.
   * Triggers a browser file download with a descriptive filename.
   */
  function exportPlainText() {
    const ui = global.DaryaUI;
    if (!ui.state.lang || ui.state.transcript.length === 0) return;
    downloadTextFile(
      `darya-chat-${ui.state.lang.code}-${exportTimestamp()}.txt`,
      buildPlainTextTranscript(),
      'text/plain'
    );
  }

  // Export for use by app.js
  global.DaryaExport = {
    exportMarkdown,
    exportPlainText,
  };
})(typeof window !== 'undefined' ? window : globalThis);
