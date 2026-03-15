DOMAINS = [
    "gmail.com",
    "yahoo.com",
    "outlook.com",
    "hotmail.com",
    "icloud.com",
    "live.com",
]


def generate_email_permutations(full_name: str) -> list[str]:
    parts = full_name.lower().strip().split()

    if len(parts) < 2:
        first, last = parts[0], ""
    else:
        first, last = parts[0], parts[-1]

    patterns = [
        f"{first}.{last}",       # peter.hansen
        f"{first}{last}",        # peterhansen
        f"{first[0]}.{last}",    # p.hansen
        f"{first[0]}{last}",     # phansen
        f"{first}",              # peter
        f"{first}_{last}",       # peter_hansen
    ]
    
    emails = []
    
    for pattern in patterns:
        for domain in DOMAINS:
            emails.append(f"{pattern}@{domain}")
            
    return emails
