/**
 * Darya classic script.
 */

(function (global) {
  'use strict';

  // ========================================================================
  // Constants
  // ========================================================================

  /** Maximum number of log entries kept in the ring buffer. */
  var DEFAULT_MAX_BUFFER_SIZE = 200;

  /** Prefix added to every Darya log line for easy filtering. */
  var LOG_PREFIX = '[Darya]';

  // ========================================================================
  // Internal state
  // ========================================================================

  /** @type {Array} Ring buffer of log entries. */
  var buffer = [];

  /** @type {number} Maximum entries in the buffer before oldest are dropped. */
  var maxBufferSize = DEFAULT_MAX_BUFFER_SIZE;

  /** @type {boolean} Master enable/disable switch for all logging. */
  var loggingEnabled = true;

  /** Current buffer write index for the ring buffer. */
  var bufferIndex = 0;

  /** Total number of entries ever written (for monotonically increasing IDs). */
  var totalEntries = 0;

  // ========================================================================
  // Helpers
  // ========================================================================

  /**
   * Returns a formatted ISO timestamp string for the current time.
   * @returns {string}
   */
  function getTimestamp() {
    try {
      return new Date().toISOString();
    } catch (e) {
      return '';
    }
  }

  /**
   * Converts one or more arguments into a single string for the log buffer.
   * Objects are stringified with JSON; errors include their stack trace.
   * @param {...*} args - Arguments to serialize
   * @returns {string}
   */
  function serializeArgs(args) {
    var parts = [];
    for (var i = 0; i < args.length; i += 1) {
      var arg = args[i];
      if (typeof arg === 'string') {
        parts.push(arg);
      } else if (arg instanceof Error) {
        parts.push(
          arg.message + (arg.stack ? ' (' + arg.stack.split('\n')[0] + ')' : '')
        );
      } else if (typeof arg === 'object' && arg !== null) {
        try {
          var str = JSON.stringify(arg, null, 0);
          // Truncate very long serialized objects to avoid bloating the buffer
          if (str.length > 500) {
            str = str.substring(0, 500) + '... [truncated]';
          }
          parts.push(str);
        } catch (e) {
          parts.push('[unserializable object]');
        }
      } else {
        parts.push(String(arg));
      }
    }
    return parts.join(' ');
  }

  /**
   * Appends a log entry to the ring buffer. If the buffer is full, the
   * oldest entry is overwritten.
   * @param {string} level - 'info', 'warn', 'error', or 'debug'
   * @param {string} message - The serialized log message
   */
  function appendToBuffer(level, message) {
    var entry = {
      id: totalEntries,
      ts: getTimestamp(),
      level: level,
      msg: message
    };

    // Ring buffer: overwrite at bufferIndex, then wrap around
    buffer[bufferIndex] = entry;
    bufferIndex = (bufferIndex + 1) % maxBufferSize;
    totalEntries += 1;
  }

  /**
   * Core logging function. Formats the arguments, writes to the console
   * (if available), and stores a structured entry in the ring buffer.
   * Warnings and errors are always buffered; info entries are buffered
   * as long as the buffer is not at max capacity; debug entries are
   * never buffered (console only).
   * @param {string} level - 'info', 'warn', 'error', or 'debug'
   * @param {...*} args - Arguments to log
   */
  function log(level, args) {
    // Guard: respect the master enable switch
    if (!loggingEnabled) {
      return;
    }

    var message = serializeArgs(args);
    var label = level.toUpperCase();

    // Write to console with the appropriate method
    try {
      var consoleArgs = [LOG_PREFIX + ' [' + label + ']', message];
      switch (level) {
        case 'error':
          console.error.apply(console, consoleArgs);
          break;
        case 'warn':
          console.warn.apply(console, consoleArgs);
          break;
        case 'debug':
          // Debug goes only to console, not to the ring buffer
          console.debug.apply(console, consoleArgs);
          return;
        default:
          console.log.apply(console, consoleArgs);
          break;
      }
    } catch (e) {
      // Console may not be available in all environments
      // Silently fall through to buffer-only logging
    }

    // Store in the ring buffer (warn/error always, info if space allows)
    if (level === 'debug') {
      return;
    } // debug is console-only
    appendToBuffer(level, message);
  }

  // ========================================================================
  // Public API
  // ========================================================================

  /**
   * Logs an informational message. Stored in the ring buffer (unless full).
   * @param {...*} args
   */
  function info() {
    log('info', arguments);
  }

  /**
   * Logs a warning message. Always stored in the ring buffer.
   * @param {...*} args
   */
  function warn() {
    log('warn', arguments);
  }

  /**
   * Logs an error message. Always stored in the ring buffer.
   * @param {...*} args
   */
  function error() {
    log('error', arguments);
  }

  /**
   * Logs a debug message. Console only; not stored in the ring buffer.
   * @param {...*} args
   */
  function debug() {
    log('debug', arguments);
  }

  /**
   * Returns a shallow copy of the current log buffer entries, ordered
   * from oldest to newest. The caller can safely iterate or filter the
   * returned array without affecting the internal buffer.
   * @returns {Array}
   */
  function getBuffer() {
    // Reconstruct chronological order from the ring buffer
    var result = [];
    var count = Math.min(totalEntries, maxBufferSize);
    for (var i = 0; i < count; i += 1) {
      var idx = (bufferIndex + i) % maxBufferSize;
      if (buffer[idx]) {
        result.push(buffer[idx]);
      }
    }
    return result;
  }

  /**
   * Empties the log buffer, resetting all state. Running count of total
   * entries is also reset.
   */
  function clearBuffer() {
    buffer = [];
    bufferIndex = 0;
    totalEntries = 0;
  }

  /**
   * Changes the maximum buffer size. If the new size is smaller than the
   * current number of entries, the oldest entries are dropped.
   * @param {number} size - New maximum buffer size (minimum 10)
   */
  function setMaxBufferSize(size) {
    var safeSize = Math.max(10, Math.floor(size) || DEFAULT_MAX_BUFFER_SIZE);
    maxBufferSize = safeSize;

    // If the buffer has more entries than the new size, trim oldest entries
    if (totalEntries > safeSize) {
      var entries = getBuffer();
      var overflow = entries.length - safeSize;
      if (overflow > 0) {
        entries = entries.slice(overflow);
      }
      buffer = entries;
      bufferIndex = buffer.length % safeSize;
      totalEntries = buffer.length;
    }
  }

  // ========================================================================
  // Import existing console methods for fallback
  // ========================================================================

  /**
   * Hooks into the global error handler to automatically log uncaught
   * exceptions and unhandled promise rejections via the logger. This
   * captures errors that might otherwise go unnoticed, especially in
   * production environments where the console isn't actively monitored.
   *
   * Multiple installations are idempotent: the handlers check for a
   * marker property to avoid double-wiring.
   */
  function installGlobalErrorHandler() {
    // Prevent double installation
    if (global.__daryaLoggerInstalled) {
      return;
    }
    global.__daryaLoggerInstalled = true;

    // Uncaught exceptions
    (typeof window !== 'undefined' ? window : globalThis).addEventListener(
      'error',
      function (event) {
        if (event.error) {
          error('Uncaught exception:', event.error.message);
        } else if (event.message) {
          error('Uncaught exception:', event.message);
        }
        // Don't prevent default browser error handling
      }
    );

    // Unhandled promise rejections
    (typeof window !== 'undefined' ? window : globalThis).addEventListener(
      'unhandledrejection',
      function (event) {
        var reason = event.reason;
        if (reason instanceof Error) {
          error('Unhandled promise rejection:', reason.message);
        } else if (reason) {
          error('Unhandled promise rejection:', String(reason));
        } else {
          error('Unhandled promise rejection (no reason)');
        }
      }
    );
  }

  // Install the global error handler at module load time
  if (typeof window !== 'undefined') {
    installGlobalErrorHandler();
  }

  const DaryaLogger = {
    info,
    warn,
    error,
    debug,
    getBuffer,
    clearBuffer,
    setMaxBufferSize,
    get enabled() {
      return loggingEnabled;
    },
    set enabled(val) {
      loggingEnabled = !!val;
    }
  };

  global.DaryaLogger = DaryaLogger;
})(typeof window !== 'undefined' ? window : globalThis);
