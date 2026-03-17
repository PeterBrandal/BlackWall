import ssl
import socket
import asyncio
from datetime import datetime, timezone


async def probe(target: str):
    def get_cert():
        ctx = ssl.create_default_context()
        conn = ctx.wrap_socket(socket.socket(), server_hostname=target)
        conn.settimeout(10)
        conn.connect((target, 443))
        cert = conn.getpeercert()
        conn.close()
        return cert

    try:
        cert = await asyncio.to_thread(get_cert)
    except ssl.SSLCertVerificationError:
        yield "[ssl] INVALID — Certificate verification failed"
        return
    except ConnectionRefusedError:
        yield "[ssl] FAILED — Port 443 not open"
        return
    except Exception as e:
        yield f"[ssl] FAILED — {type(e).__name__}"
        return

    # Expiry
    expiry = datetime.strptime(cert["notAfter"], "%b %d %H:%M:%S %Y %Z").replace(tzinfo=timezone.utc)
    days_left = (expiry - datetime.now(timezone.utc)).days

    # Issuer
    issuer = dict(x[0] for x in cert["issuer"])
    org = issuer.get("organizationName", "—")

    # Common name
    subject = dict(x[0] for x in cert["subject"])
    cn = subject.get("commonName", "—")

    # SANs
    sans = [v for t, v in cert.get("subjectAltName", []) if t == "DNS"]

    yield f"[ssl] Common Name  : {cn}"
    yield f"[ssl] Issuer       : {org}"
    yield f"[ssl] Expires      : {expiry.strftime('%Y-%m-%d')}"
    yield f"[ssl] Days Left    : {days_left}"

    for san in sans[:6]:
        yield f"[ssl] SAN          : {san}"
