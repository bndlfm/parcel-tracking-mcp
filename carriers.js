export function createCarrierIndex(rows) {
    const carrierNameToId = new Map();
    for (const row of rows) {
        const id = Number(row.key);
        for (const name of [row.name_en, row.name_cn, row.name_hk]) {
            if (name)
                carrierNameToId.set(name.trim().toLowerCase(), id);
        }
    }
    return {
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
