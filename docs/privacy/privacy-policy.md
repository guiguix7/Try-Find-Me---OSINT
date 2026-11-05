# Privacy Policy — Try Find Me! — OSINT

## Summary

- No accounts, no tracking, no analytics, no advertising.
- Nothing you search for is persisted. Assets, results, evidence, risk analysis, and reports live in memory during the investigation and in your browser afterwards. Close it and it is gone.
- The server writes logs for operations and debugging, but logs **never** contain the assessed asset, tokens, API keys, or other personal data.

## What Is Not True (and We Do Not Claim It)

"We collect no data" would be inaccurate. To perform an assessment, the asset you enter **is sent to the backend and to third-party services** (for example, certificate transparency search, DNS resolvers, RDAP servers). Before every search, the interface lists which services will receive the asset and what they receive. Those services have their own privacy policies.

Running the application locally does not mean all data remains on your machine. Requests to public sources still leave your device. The interface makes this distinction clear.

## Where Data Lives

| Information | Location | Persistence |
|---|---|---|
| Asset (domain) | Server memory during the assessment | Temporary |
| Results, evidence, risk analysis | Server memory, then the browser | Temporary |
| Report | Browser | Until you close or export it |
| Visual preferences | Browser localStorage (optional) | Until you clear it |
| Application code and configuration | Local files | Permanent |

No cookies are used. There is no database in the MVP.

## Third-Party Transparency

Before starting an investigation, the interface explains:

- Which external services will be queried.
- Which asset information will be transmitted.
- Why each service is needed.
- What type of information may be returned.
- That external services may independently log requests under their own policies.

### Phase 1 External Services

| Service | Purpose | Data Sent |
|---|---|---|
| crt.sh | Certificate transparency search for subdomain discovery | The domain name |
| DNS resolver | Public DNS record lookup (NS, MX, SPF, DMARC, CAA) | The domain name |
| RDAP bootstrap servers | Registration information lookup | The domain name |

## Passwords (Phase 2 — Independent Module)

The password checker is independent of assessments and runs in your browser. Only a short prefix of the password's hash is sent to the lookup service (k-anonymity). The full password and full hash never leave your device, and nothing is stored or logged.

## Exports

Exporting a report creates a file on your device. You are responsible for storing it safely: it describes your exposure.

## Public Instances

An operator of a public instance becomes responsible for additional obligations (see `LEGAL.md`) and must publish their own privacy notice.

## Data Subject Rights

Since no data is persisted in local mode, there is no stored data to access, rectify, or erase. Closing the report discards all temporary data.

In public instance mode, the operator may become a controller or processor under LGPD/GDPR and must provide a legal basis, privacy notice, and channel for data subject requests.
