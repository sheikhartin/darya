/**
 * Darya conversation export: Markdown and plain-text transcript downloads.
 * Nearly standalone -- reads transcript and lang from the shared DaryaUI
 * namespace (set by core.js), and exposes functions called by app.js.
 */
(function (global) {
  'use strict';

  /**
   * Formats a date using the active language's locale for human-readable
   * export headers.
   * @param {Date} date
   * @returns {string}
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
   * @returns {string}
   */
  function buildExportHeader() {
    const lines = [];
    lines.push(formatLocalizedDateTime(new Date()));
    return lines.join('\n');
  }

  /**
   * Builds a Markdown-formatted transcript of the entire conversation.
   * @returns {string}
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
   * @returns {string}
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
   * element with a Blob URL. The URL is revoked immediately after download.
   * @param {string} filename
   * @param {string} content
   * @param {string} mimeType
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
   * @returns {string}
   */
  function exportTimestamp() {
    return new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
  }

  /**
   * Exports the conversation transcript as a Markdown file.
   * No-op if there is no active language or no transcript content.
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
