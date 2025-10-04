const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const BASE58_BASE = 58n;
const FNV_OFFSET_BASIS_64 = 0xcbf29ce484222325n;
const FNV_PRIME_64 = 0x100000001b3n;

function fnv1a64(input: string): bigint {
    let hash = FNV_OFFSET_BASIS_64;

    for (let i = 0; i < input.length; i++) {
        hash ^= BigInt(input.charCodeAt(i));
        hash = (hash * FNV_PRIME_64) & 0xFFFFFFFFFFFFFFFFn;
    }

    return hash;
}

function base58Encode(value: bigint): string {
    if (value === 0n) {
        return BASE58_ALPHABET[0];
    }

    let encoded = "";
    let current = value;

    while (current > 0n) {
        const remainder = current % BASE58_BASE;
        encoded = BASE58_ALPHABET[Number(remainder)] + encoded;
        current = current / BASE58_BASE;
    }

    return encoded;
}

export interface CardSlugParts {
    moduleId: string;
    subModuleId: string;
    cardDeckId: string;
    cardId: string;
}

export function generateCardSlug(parts: CardSlugParts, salt = 0): string {
    const payload = `${parts.moduleId}|${parts.subModuleId}|${parts.cardDeckId}|${parts.cardId}|${salt}`;
    const hash = fnv1a64(payload);
    return base58Encode(hash);
}
