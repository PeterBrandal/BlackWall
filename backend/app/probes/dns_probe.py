import dns.resolver
import asyncio
import re

RECORD_TYPES = ["A", "MX", "NS", "TXT"]

# Verification token patterns — noisy, no intel value
VERIFICATION_PATTERNS = re.compile(
    r"(MS=ms|google-site-verification|facebook-domain-verification|"
    r"docker-verification|apple-domain-verification|"
    r"adobe-sign-verification|atlassian-domain-verification|"
    r"[a-f0-9]{32,})",  # long hex strings
    re.IGNORECASE,
)


def _is_useful_txt(value: str) -> bool:
    """Keep SPF, DMARC, DKIM and other meaningful records. Drop verification tokens."""
    clean = value.strip('"')
    if VERIFICATION_PATTERNS.search(clean):
        return False
    return True


async def probe(target: str):
    for rtype in RECORD_TYPES:
        try:
            answers = await asyncio.to_thread(
                dns.resolver.resolve, target, rtype, lifetime=5
            )
            for rdata in answers:
                value = str(rdata).rstrip(".")

                if rtype == "TXT":
                    if not _is_useful_txt(value):
                        continue
                    if len(value) > 80:
                        value = value[:80] + "..."

                yield f"[dns] {rtype.ljust(3)} : {value}"

        except dns.resolver.NoAnswer:
            yield f"[dns] {rtype.ljust(3)} : —"
        except dns.resolver.NXDOMAIN:
            yield f"[dns] Domain does not exist: {target}"
            return
        except Exception as e:
            yield f"[dns] {rtype.ljust(3)} : error ({type(e).__name__})"
