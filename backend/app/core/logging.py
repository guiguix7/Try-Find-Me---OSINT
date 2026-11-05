"""Structured, privacy-safe logging configuration.

Logs never contain assessed domains, tokens, passwords, hashes, or personal data.
Use generic event identifiers, status codes, and operational metadata.
"""

import logging
import sys
from typing import Any


def get_logger(name: str) -> logging.Logger:
    """Return a configured logger for the given module name."""
    logger = logging.getLogger(name)
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(_PrivacySafeFormatter())
        logger.addHandler(handler)
    logger.setLevel(logging.INFO)
    logger.propagate = False
    return logger


class _PrivacySafeFormatter(logging.Formatter):
    """Formatter that emits JSON-like structured logs without sensitive data."""

    def format(self, record: logging.LogRecord) -> str:
        # Build a safe, structured log entry.
        # The 'msg' and 'args' must never contain domains, tokens, or personal data.
        entry: dict[str, Any] = {
            "level": record.levelname,
            "logger": record.name,
            "event": record.getMessage(),
        }
        if record.exc_info:
            entry["exception"] = self.formatException(record.exc_info)
        # Only include safe, non-sensitive extras if present.
        for key in ("request_id", "status_code", "duration_ms", "component"):
            val = getattr(record, key, None)
            if val is not None:
                entry[key] = val
        return str(entry)


def log_event(
    logger: logging.Logger,
    level: int,
    event: str,
    request_id: str | None = None,
    status_code: int | None = None,
    duration_ms: float | None = None,
    component: str | None = None,
) -> None:
    """Emit a privacy-safe structured log event.

    All parameters are operational metadata only. Never pass assessed domains,
    tokens, passwords, hashes, or personal data through any parameter.
    """
    extra: dict[str, Any] = {}
    if request_id is not None:
        extra["request_id"] = request_id
    if status_code is not None:
        extra["status_code"] = status_code
    if duration_ms is not None:
        extra["duration_ms"] = duration_ms
    if component is not None:
        extra["component"] = component
    logger.log(level, event, extra=extra)
