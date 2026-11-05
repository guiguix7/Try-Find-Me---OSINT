# Legal notice and compliance guidelines

**This document is not legal advice.** It is a working map of legal risks for the maintainers. Have a lawyer review it before operating any public instance.

## Intended use

Try Find Me! is for authorized assessments of assets you own or are explicitly authorized to assess. It performs only passive lookups in public sources.

## Design rules that keep the project lawful

1. **No unauthorized access.** Public sources and official APIs only. Never log in to anything, guess credentials, bypass authentication, CAPTCHAs, rate limits or technical blocks. Never connect to the assessed infrastructure (no port scans, no probing).
2. **Respect source terms.** Every module documents the terms of its source in `docs/sources.md`. Honor `robots.txt` and rate limits. If a source forbids automated use, the module does not exist.
3. **No breached data.** The project never stores, mirrors, displays or redistributes leaked credentials or dumps. It may only query legitimate services that report whether an asset appeared in a breach.
4. **Exposed secrets.** If a report indicates an exposed secret, the recommendation is to revoke and rotate it. The tool never uses the secret.
5. **Authorization for third-party assets.** Assessing a domain you do not control requires written authorization from its owner. The DNS TXT verification is the technical mechanism, and the interface says so.
6. **No profiling of people.** No search by full name, no photo or face search, no aggregation of data about individuals.

## Personal data (LGPD – Lei 13.709/2018, GDPR)

- **Local mode:** the user processes their own data on their own machine.
- **Public instance:** the operator may become a controller or processor. Before launching one, the operator needs a legal basis (e.g., consent), a privacy notice, a channel for data subject requests and, in Brazil, an appointed data protection officer (encarregado).
- **International transfers:** sending an asset to a third-party API abroad is a cross-border transfer (LGPD art. 33; GDPR chapter V). The consent screen lists every service that receives the asset and, where known, its country.
- **Minors:** the tool is intended for adults.

## Computer crime statutes (examples, not exhaustive)

Brazil: Código Penal art. 154-A (invasão de dispositivo informático). United States: CFAA. United Kingdom: Computer Misuse Act. The passive-only design exists to stay clearly outside these statutes.

## Licensing

AGPL-3.0-or-later. Operators of modified public instances must offer the corresponding source code. Check dependency licenses for AGPL compatibility, and do not use third-party names or marks in a way that implies endorsement.

## Limits of this project's controls

The ownership verification is a friction and consent mechanism, not a cryptographic guarantee, and open-source code can be modified by anyone who runs it. See `docs/ownership-verification.md`.

## Disclaimer

The software is provided "as is", without warranty. Reports describe public information at a point in time and can be incomplete or outdated. They are not a security audit or a legal opinion.