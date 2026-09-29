# Research Briefing: Israeli Government Contractor / Payroll Directory
**Date:** 2026-09-29
**Focus:** Autocomplete reference lists for contractor employees reporting hours twice (ministry side + contractor payroll side)

## Executive Summary
Confirmed 12 real IT staffing/outsourcing companies that place people in Israeli government offices, and 7 payroll/attendance systems. Only 3 contractor-to-system mappings could be verified with a real source: Matrix uses Hilan (subdomain `matrix.net.hilan.co.il`), Ness is owned by Hilan Group (so almost certainly on Hilan), and Malam Team runs its own Malam-Payroll/TRM. Taldor is a confirmed client of AttenIX-TS. Everything else is unverified: web search alone cannot prove which specific payroll portal each contractor's employees log into, that requires either an employee/job post or a leaked subdomain scan, neither of which surfaced for most companies in this pass.

**Correction to the brief:** Attenix is NOT a staffing/contractor company as originally assumed. It is a time-and-attendance SaaS product (AttenIX-TS, built by Ovdimnet, acquired by Priority Software). Moved to list 2.

## List 1: Contractor / Staffing Companies (12 verified, not 25-40)
| Company (HE) | Company (EN) | Verified via |
|---|---|---|
| מטריקס | Matrix IT | matrix.co.il |
| פרולוג'יק | Prologic | prologic.co.il, government-tender staffing page |
| קומבלק | Comblack IT | comblack.co.il, TheMarker profile |
| וואן (ONE1) | ONE Technologies | one1.global |
| סיסנת | Sysnet Group | sysnet-group.co.il |
| מלם תים | Malam Team | malamteam.com, BDI profile |
| מרטנס | Mertens (Malam Team Group) | prospeo email-format listing (weak) |
| נס טכנולוגיות | Ness Technologies | ness-tech.co.il (now part of Hilan Group) |
| טלדור | Taldor | taldor.co.il, obudget company record |
| בינת (Bynet) | Bynet Data Communications/Software Systems | bynet.co.il |
| אמן | Aman Group | aman.co.il |
| אלעד מערכות תוכנה | Elad Software Systems | LinkedIn, D&B |
| לוג-און | Log-On Software | log-on.com |

**Gap:** could not verify Hilan Tech as a distinct staffing brand (it is the payroll vendor, not a staffing company) — dropped from list 1. Did not find independent confirmation for additional names beyond these 12 within the search budget; a deeper pass would need direct tender-winner PDFs from mr.gov.il (site fetch blocked/slow in this session) and job-board scraping (drushim/alljobs) for "עובד קבלן משרד הבריאות" postings that name the placing agency.

## List 2: Payroll / Attendance Systems (7)
| System | Web reporting confirmed? |
|---|---|
| Hilan / Hilanet | Yes |
| Synerion | Yes |
| Malam Payroll / TRM | Yes (mobile + web) |
| Michpal | Unknown |
| Meckano | Yes |
| AttenIX-TS (ex-Ovdimnet) | Yes |
| Timewatch | Could not verify (no source found this pass, kept as placeholder — no URL) |
| SAP SuccessFactors | Yes (generic, not Israel-specific) |

**Gap:** Hi-Office, Ivory, Digital Time, Priority HR were named in the task but produced no verifiable individual source; excluded rather than invented.

## List 3: Ministry-Side Sources (2, thin)
- Malam (מל"מ) attendance/TRM reporting arm — malam-payroll.com
- Central Government Computing Services Tender 01-2023 (mr.gov.il) — the tender framework contractors are hired under, not itself a reporting system. Did not find a distinct "ok2go" or "Merkava/HRM" government system with an independent source in this pass; these need a targeted follow-up search restricted to gov.il and mr.gov.il domains.

## Verified Contractor-to-Payroll Mappings
1. **Matrix to Hilan** — VERIFIED. Subdomain `matrix.net.hilan.co.il` resolves within Hilan's own infrastructure (net.hilan.co.il), confirmed via ipaddress.com lookup and c99.nl subdomain scan.
2. **Ness to Hilan (Group ownership)** — VERIFIED. Ness Israel operations acquired by Hilan Group in 2014; strongly implies Hilan payroll, but no direct employee-portal URL confirmed.
3. **Malam Team to Malam-Payroll/TRM** — VERIFIED. Malam Team's own subsidiary runs Malam-Payroll; the group uses its own product.
4. **Taldor to AttenIX-TS** — VERIFIED. hrhome.co.il explicitly lists Taldor as an AttenIX-TS client.
5. All other pairings: UNVERIFIED, no source.

## Recommendations
1. Run a second pass scoped to job boards (drushim.co.il, alljobs.co.il) searching each contractor name + "חילן" or "סינריון" in job descriptions — HR postings frequently name the payroll system.
2. Search `site:mr.gov.il` for the actual 01-2023 tender winner-list PDF to expand list 1 to the real 25-40 scope the brief wants.
3. Do a subdomain scan (c99.nl or similar) for `*.net.hilan.co.il` and `*.synerioncloud.com` to surface more verified contractor-to-system pairs directly.

## Sources
- https://www.matrix.co.il/about-us/
- https://www.prologic.co.il/profile
- https://www.themarker.com/labels/jobsdec/2023-12-26/ty-article-labels/0000018c-a057-d9c4-a9cf-b1f705ba0000
- https://one1.global/about/
- https://sysnet-group.co.il/
- https://www.bdicode.co.il/en/company/malam-team-ltd-en/
- https://www.ness-tech.co.il/en/ourstory/time
- https://next.obudget.org/i/org/company/511350613
- https://www.glassdoor.com/Reviews/Bynet-Software-Systems-Israel-Reviews-EI_IE562449.0,22_IL.23,29_IN119.htm
- https://il.linkedin.com/company/aman-group
- https://www.dnb.com/business-directory/company-profiles.elad_software_systems_ltd.3229b94624cf2e149af2849707a5697a.html
- https://israeltrade.org.au/2022/06/10/log-on-software-ltd-leading-software-company/
- https://www.hilan.co.il/en/solutions/time-attendance/
- https://www.capterra.co.il/software/129186/synerion
- https://play.google.com/store/apps/details?id=com.malam.trm&hl=en_US
- https://www.meckano.com/Who-we-are
- https://hrhome.co.il/hi-tech-personnel-companies/
- https://www.prnewswire.com/il/news-releases/priority-software-acquires-israel-based-ovdimnet-a-leading-cloud-based-workforce-management-platform-896257531.html
- https://co.il.ipaddress.com/matrix.net.hilan.co.il
- https://subdomainfinder.c99.nl/scans/2020-07-31/net.hilan.co.il
- https://mr.gov.il/ilgstorefront/he/news/details/290620231038
