# Privacy

## Summary

- No accounts, no tracking, no analytics, no advertising.
- **Nothing you search for is persisted.** Assets, results, evidence, risk analysis and reports live in memory during the investigation and in your browser afterwards. Close it and it is gone.
- The server writes logs for operations and debugging, but logs **never** contain the assessed asset, tokens, API keys or other personal data.

## What is not true (and we do not claim it)

"We collect no data" would be inaccurate. To perform an assessment, the asset you enter **is sent to the backend and to third-party services** (for example, certificate transparency search, DNS resolvers, RDAP servers). Before every search, the interface lists which services will receive the asset and what they receive. Those services have their own privacy policies.

## Where data lives

| Information | Location | Persistence |
|---|---|---|
| Asset | Server memory during the assessment | Temporary |
| Results, evidence, risk analysis | Server memory, then the browser | Temporary |
| Report | Browser | Until you close or export it |
| Visual preferences | Browser localStorage (optional) | Until you clear it |
| API keys you provide (Phase 2, local mode only) | Process memory | Not persisted by default |
| Application code and configuration | Local files | Permanent |

No cookies are used. There is no database in the MVP.

## Passwords (Phase 2)

The password checker is independent of assessments and runs in your browser. Only a short prefix of the password's hash is sent to the lookup service (k-anonymity). The full password and full hash never leave your device, and nothing is stored or logged.

## Exports

Exporting a report creates a file on your device. You are responsible for storing it safely: it describes your exposure.

## Public instances

An operator of a public instance becomes responsible for additional obligations (see `LEGAL.md`) and must publish their own privacy notice.