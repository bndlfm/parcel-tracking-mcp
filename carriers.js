import Fuse from "fuse.js";
export function createCarrierIndex(rows) {
    const carrierNameToId = new Map();
    for (const row of rows) {
        const id = Number(row.key);
        for (const name of [row.name_en, row.name_cn, row.name_hk]) {
            if (name)
                carrierNameToId.set(name.trim().toLowerCase(), id);
        }
    }
    const fuse = new Fuse(rows, {
        keys: ["name_en", "name_cn", "name_hk"],
        threshold: 0.4,
        includeScore: true,
    });
    return {
        search(query, limit = 10) {
            const keyword = query.trim().toLowerCase();
            const exactMatches = rows.filter((row) => [row.name_en, row.name_cn, row.name_hk].some((name) => name.toLowerCase().includes(keyword)));
            const matches = exactMatches.length > 0
                ? exactMatches
                : fuse.search(keyword).map((match) => match.item);
            return matches.slice(0, limit).map((row) => ({ id: Number(row.key), name: row.name_en }));
        },
        resolve(input) {
            if (typeof input === "number") {
                return Number.isInteger(input) && rows.some((row) => Number(row.key) === input)
                    ? input
                    : undefined;
            }
            const value = input.trim();
            if (!value)
                return undefined;
            const numeric = Number(value);
            if (/^\d+$/.test(value) && Number.isInteger(numeric)) {
                return rows.some((row) => Number(row.key) === numeric) ? numeric : undefined;
            }
            const exact = carrierNameToId.get(value.toLowerCase());
            return exact;
        },
        isValidId(id) {
            return Number.isInteger(id) && rows.some((row) => Number(row.key) === id);
        },
    };
}
