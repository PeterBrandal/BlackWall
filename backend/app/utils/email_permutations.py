DOMAINS = [
    "gmail.com",
    "yahoo.com",
    "outlook.com",
    "hotmail.com",
    "icloud.com",
    "live.com",
]


def generate_email_permutations(full_name: str) -> list[str]:
    cleaned = full_name.lower().strip()

    # If input is already an email, return it as-is
    if "@" in cleaned:
        return [cleaned]

    parts = cleaned.split()
    first = parts[0]
    last  = parts[-1] if len(parts) > 1 else ""

    if last:
        patterns = [
            f"{first}.{last}",
            f"{first}{last}",
            f"{first[0]}.{last}",
            f"{first[0]}{last}",
            f"{first}_{last}",
            f"{first}",
        ]
    else:
        patterns = [f"{first}"]

    emails = []
    for pattern in patterns:
        for domain in DOMAINS:
            emails.append(f"{pattern}@{domain}")

    return emails
