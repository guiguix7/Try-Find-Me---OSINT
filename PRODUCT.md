# Product — Try Find Me! — OSINT

An open-source, passive OSINT platform for authorized digital exposure assessments, helping users discover, understand, and reduce their public digital footprint.

## Mission

Give users a transparent and understandable way to discover publicly exposed information about digital assets they own or are authorized to assess.

The application must not be presented as a tool for investigating arbitrary people. Its purpose is digital exposure awareness and protection.

## Core Pillars — DEIP

1. **Discovery:** identify relevant information available through legitimate public sources.
2. **Evidence:** document where each finding came from, when it was retrieved and how reliable the match is.
3. **Intelligence:** interpret findings using transparent and deterministic rules.
4. **Protection:** provide concrete recommendations that help users reduce their digital exposure.

## Supported Assets (MVP)

| Asset | Phase | Ownership/control verification |
|---|---|---|
| Domains | MVP | DNS TXT record containing a temporary signed verification token |
| Subdomains | MVP | Passive discovery through certificate transparency |
| DNS records | MVP | Public DNS information |
| RDAP information | MVP | Public registration information |

## Permanently Excluded

- Searching people by full name.
- Searching or identifying people through photographs.
- Facial recognition.
- Reverse image identification of individuals.
- Doxxing functionality.
- Investigating arbitrary individuals.
- Active port scanning.
- Brute-force attacks.
- Credential stuffing.
- Password guessing.
- Authentication bypass.
- Unauthorized account access.
- Exploitation of vulnerabilities.
- Active requests to target infrastructure.
