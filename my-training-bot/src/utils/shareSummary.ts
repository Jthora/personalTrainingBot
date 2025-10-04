import { Card } from "../types/Card";
import { CardMeta } from "../cache/TrainingModuleCache";

const ELLIPSIS = "…";

interface ShareSummaryOptions {
    card: Card;
    meta: CardMeta;
    shortUrl?: string;
    maxLength?: number;
}

interface ShareSummaryResult {
    text: string;
    summary: string;
    hashtags: string[];
    shortUrl?: string;
}

const DEFAULT_MAX_LENGTH = 280;

const sanitizeText = (text: string) =>
    text
        .replace(/\r?\n+/g, " ")
        .replace(/\\[()[\]]/g, "")
        .replace(/\$\$/g, "")
        .replace(/\s+/g, " ")
        .trim();

const truncate = (text: string, limit: number): string => {
    if (limit <= 0) {
        return "";
    }

    if (text.length <= limit) {
        return text;
    }

    if (limit === 1) {
        return ELLIPSIS;
    }

    return `${text.slice(0, limit - 1).trimEnd()}${ELLIPSIS}`;
};

const buildHashtags = (card: Card, meta: CardMeta): string[] => {
    const tags: string[] = [];

    const toTag = (value: string | undefined) => {
        if (!value) {
            return undefined;
        }
        const sanitized = value.replace(/[^A-Za-z0-9]/g, "");
        if (!sanitized) {
            return undefined;
        }
        return `#${sanitized}`;
    };

    const difficultyTag = toTag(card.difficulty);
    if (difficultyTag) {
        tags.push(difficultyTag);
    }

    const moduleTag = toTag(meta.moduleName);
    if (moduleTag && !tags.includes(moduleTag)) {
        tags.push(moduleTag);
    }

    return tags.slice(0, 2);
};

const composeContent = (card: Card, limit: number): string => {
    const title = sanitizeText(card.title);
    const description = sanitizeText(card.description);
    const bulletpoints = Array.isArray(card.bulletpoints)
        ? card.bulletpoints.map(sanitizeText).filter(Boolean)
        : [];

    let summary = truncate(title, limit);
    let remaining = limit - summary.length;

    if (remaining <= 0) {
        return summary;
    }

    const bulletLimit = Math.min(2, bulletpoints.length);
    for (let i = 0; i < bulletLimit; i += 1) {
        const point = bulletpoints[i];
        const prefix = summary.length ? "\n• " : "• ";
        const available = remaining - prefix.length;
        if (available <= 0) {
            break;
        }

        const truncatedPoint = truncate(point, available);
        if (!truncatedPoint) {
            break;
        }

        summary += `${prefix}${truncatedPoint}`;
        remaining = limit - summary.length;

        if (remaining <= 0) {
            return summary;
        }
    }

    if (description && remaining > 0) {
        const prefix = summary.length ? "\n" : "";
        const available = remaining - prefix.length;
        if (available > 0) {
            summary += `${prefix}${truncate(description, available)}`;
        }
    }

    return summary;
};

export const generateShareSummary = ({ card, meta, shortUrl, maxLength = DEFAULT_MAX_LENGTH }: ShareSummaryOptions): ShareSummaryResult => {
    const hashtags = buildHashtags(card, meta);
    const hashtagsString = hashtags.join(" ");
    const hashtagsPartLength = hashtagsString ? hashtagsString.length + 1 : 0; // newline before hashtags
    const urlPartLength = shortUrl ? shortUrl.length + 2 : 0; // blank line (\n\n) before URL

    const allowedSummaryLength = Math.max(0, maxLength - hashtagsPartLength - urlPartLength);
    const rawSummaryText = typeof card.summaryText === "string" ? sanitizeText(card.summaryText) : "";
    const summarySource = rawSummaryText.length ? rawSummaryText : composeContent(card, allowedSummaryLength);
    const summary = truncate(summarySource, allowedSummaryLength);

    let fullText = summary;

    if (shortUrl) {
        if (summary.length) {
            fullText += `\n\n${shortUrl}`;
        } else {
            fullText = shortUrl;
        }
    }

    if (hashtagsString) {
        const separator = fullText.length ? "\n" : "";
        fullText += `${separator}${hashtagsString}`;
    }

    if (fullText.length > maxLength) {
        const excess = fullText.length - maxLength;
        const adjustedSummaryLength = Math.max(0, summary.length - excess);
        const adjustedSummary = truncate(summary, adjustedSummaryLength);
        let adjustedFullText = adjustedSummary;

        if (shortUrl) {
            if (adjustedSummary.length) {
                adjustedFullText += `\n\n${shortUrl}`;
            } else {
                adjustedFullText = shortUrl;
            }
        }

        if (hashtagsString) {
            const separator = adjustedFullText.length ? "\n" : "";
            adjustedFullText += `${separator}${hashtagsString}`;
        }

        return {
            text: adjustedFullText,
            summary: adjustedSummary,
            hashtags,
            shortUrl,
        };
    }

    return {
        text: fullText,
        summary,
        hashtags,
        shortUrl,
    };
};
