import Fuse from "fuse.js";

export interface CarrierRow {
  key: string;
  name_en: string;
  name_cn: string;
  name_hk: string;
  url: string;
}

export function createCarrierIndex(rows: CarrierRow[]) {
  const carrierNameToId = new Map<string, number>();
  for (const row of rows) {
    const id = Number(row.key);
    for (const name of [row.name_en, row.name_cn, row.name_hk]) {
      if (name) carrierNameToId.set(name.trim().toLowerCase(), id);
    }
  }

  const fuse = new Fuse(rows, {
    keys: ["name_en", "name_cn", "name_hk"],
    threshold: 0.4,
    includeScore: true,
  });

  return {
    search(query: string, limit = 10): Array<{ id: number; name: string }> {
      const keyword = query.trim().toLowerCase();
      const exactMatches = rows.filter((row) =>
        [row.name_en, row.name_cn, row.name_hk].some((name) => name.toLowerCase().includes(keyword)),
      );
      const matches = exactMatches.length > 0
        ? exactMatches
        : fuse.search(keyword).map((match) => match.item);
      return matches.slice(0, limit).map((row) => ({ id: Number(row.key), name: row.name_en }));
    },

    resolve(input: number | string): number | undefined {
      if (typeof input === "number") {
        return Number.isInteger(input) && rows.some((row) => Number(row.key) === input)
          ? input
          : undefined;
      }

      const value = input.trim();
      if (!value) return undefined;
      const numeric = Number(value);
      if (/^\d+$/.test(value) && Number.isInteger(numeric)) {
        return rows.some((row) => Number(row.key) === numeric) ? numeric : undefined;
      }

      const exact = carrierNameToId.get(value.toLowerCase());
      return exact;
    },

    isValidId(id: number): boolean {
      return Number.isInteger(id) && rows.some((row) => Number(row.key) === id);
    },
  };
}
