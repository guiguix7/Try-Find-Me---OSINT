# Contributing

Thank you for considering contributing to Try Find Me! — OSINT.

## How to Contribute

1. Fork the repository.
2. Create a feature branch from `main`.
3. Make your changes.
4. Add or update tests for any new functionality.
5. Run the test suite and ensure all tests pass.
6. Submit a pull request.

## Code Standards

- All code, comments, documentation, and UI copy must be in English.
- Use type annotations in Python and TypeScript.
- Follow existing code style and formatting.
- No hardcoded secrets.
- No unnecessary dependencies.
- All security-sensitive changes require review.

## Testing

Backend tests use Pytest. Run with:

```bash
cd backend
pip install -e ".[dev]"
pytest
```

Frontend tests: to be added in Stage 5.

## Security

Report security issues privately. See `SECURITY.md`.

## License

AGPL-3.0-or-later.
