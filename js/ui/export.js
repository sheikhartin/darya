/**
 * Darya classic script.
 */

(function (global) {
  'use strict';

  var DaryaUI = global.DaryaUI;

  const ui = DaryaUI;

  // ========================================================================
  // Helpers
  // ========================================================================

  /**
   * Formats a date using the active language's locale for human-readable
   * export headers. Falls back to ISO-8601 if the Intl API fails or no
   * language is active (e.g., exported before conversation starts).
   * @param {Date} date - The date to format
   * @returns {string} Locale-formatted date-time string
   */
  function formatLocalizedDateTime(date) {
    var lang = global.DaryaUI ? global.DaryaUI.state.lang : null;
    if (!lang) {
      return date.toISOString();
    }
    try {
      return new Intl.DateTimeFormat(lang.ui.dateLocale, {
        dateStyle: 'full',
        timeStyle: 'short'
      }).format(date);
    } catch (error) {
      // If the locale string is invalid or the Intl API is unavailable,
      // fall back to ISO-8601 format silently.
      return date.toISOString();
    }
  }

  /**
   * Builds the header section used in both Markdown and plain-text exports.
   * Contains the localized date-time at export time.
   * @returns {string} The formatted header line
   */
  function buildExportHeader() {
    return formatLocalizedDateTime(new Date());
  }

  /**
   * Builds a Markdown-formatted transcript of the entire conversation.
   * Each message is wrapped in bold labels with italic timestamps,
   * separated by blank lines for readability. The header includes
   * the export title and localized date.
   * @returns {string} Complete Markdown transcript
   */
  function buildMarkdownTranscript() {
    var lang = ui.state.lang;
    var transcript = ui.state.transcript;
    var header = buildExportHeader();
    var lines = ['# ' + lang.ui.exportTitle, '', header, '', '---', ''];
    for (var i = 0; i < transcript.length; i += 1) {
      var entry = transcript[i];
      var label =
        entry.sender === 'user' ? lang.ui.exportYouLabel : lang.botName;
      lines.push('**' + label + '** _(' + entry.time + ')_');
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
    var lang = ui.state.lang;
    var transcript = ui.state.transcript;
    var header = buildExportHeader();
    var lines = [
      lang.ui.exportTitle,
      '',
      header,
      '',
      lang.ui.exportDivider,
      ''
    ];
    for (var i = 0; i < transcript.length; i += 1) {
      var entry = transcript[i];
      var label =
        entry.sender === 'user' ? lang.ui.exportYouLabel : lang.botName;
      lines.push(label + ' (' + entry.time + '):');
      lines.push(entry.text);
      lines.push('');
    }
    return lines.join('\n');
  }

  /**
   * Triggers a file download in the browser by creating a temporary anchor
   * element with a Blob URL. The URL is revoked immediately after the click
   * to free memory.
   *
   * Gracefully handles environments where the Blob API or URL.createObjectURL
   * are unavailable (e.g. very old browsers, some testing environments).
   * @param {string} filename - Download filename (e.g., "darya-chat-en-2025-03-15.md")
   * @param {string} content - Text content to write to the file
   * @param {string} mimeType - MIME type ("text/markdown" or "text/plain")
   */
  function downloadTextFile(filename, content, mimeType) {
    // Guard: Blob API may not be available in all environments
    if (typeof Blob === 'undefined') {
      console.warn('Darya export: Blob API not available, download skipped');
      return;
    }

    // Guard: prevent attempting to download empty content
    if (!content || content.length === 0) {
      return;
    }

    var blob;
    try {
      blob = new Blob([content], { type: mimeType + ';charset=utf-8' });
    } catch (e) {
      console.warn('Darya export: could not create Blob (' + e.message + ')');
      return;
    }

    var url;
    try {
      url = URL.createObjectURL(blob);
    } catch (e) {
      console.warn(
        'Darya export: could not create object URL (' + e.message + ')'
      );
      return;
    }

    var link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    try {
      document.body.appendChild(link);
      link.click();
    } catch (e) {
      // Some environments (e.g. test runners, sandboxed iframes) may
      // reject the DOM manipulation. Swallow silently.
    }

    // Clean up: remove the link and revoke the blob URL immediately,
    // including if the appendChild or click threw.
    try {
      if (link.parentNode) {
        document.body.removeChild(link);
      }
    } catch (e) {
      /* ignore cleanup errors */
    }

    try {
      URL.revokeObjectURL(url);
    } catch (e) {
      /* ignore revoke errors */
    }
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
    if (
      !ui.state.lang ||
      !ui.state.transcript ||
      ui.state.transcript.length === 0
    ) {
      return;
    }
    downloadTextFile(
      'darya-chat-' + ui.state.lang.code + '-' + exportTimestamp() + '.md',
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
    if (
      !ui.state.lang ||
      !ui.state.transcript ||
      ui.state.transcript.length === 0
    ) {
      return;
    }
    downloadTextFile(
      'darya-chat-' + ui.state.lang.code + '-' + exportTimestamp() + '.txt',
      buildPlainTextTranscript(),
      'text/plain'
    );
  }

  const DaryaExport = {
    exportMarkdown,
    exportPlainText
  };

  global.DaryaExport = DaryaExport;
})(typeof window !== 'undefined' ? window : globalThis);
