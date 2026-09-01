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

  return {
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
