import dns.resolver
import asyncio

RECORD_TYPES = ["A", "MX", "NS", "TXT"]


async def probe(target: str):
    for rtype in RECORD_TYPES:
        try:
            answers = await asyncio.to_thread(
                dns.resolver.resolve, target, rtype, lifetime=5
            )
            for rdata in answers:
                value = str(rdata).rstrip(".")
                # Truncate long TXT records
                if rtype == "TXT" and len(value) > 80:
                    value = value[:80] + "..."
                yield f"[dns] {rtype.ljust(3)} : {value}"
        except dns.resolver.NoAnswer:
            yield f"[dns] {rtype.ljust(3)} : —"
        except dns.resolver.NXDOMAIN:
            yield f"[dns] Domain does not exist: {target}"
            return
        except Exception as e:
            yield f"[dns] {rtype.ljust(3)} : error ({type(e).__name__})"
