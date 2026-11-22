const vm = require("node:vm");
const fs = require("node:fs");
const path = require("node:path");

const ctx = vm.createContext({ console });
vm.runInContext(fs.readFileSync(path.join(__dirname, "calendar.js"), "utf8") + "\n;globalThis.__t = { getMonthData, formatDateKey };", ctx);

const { getMonthData, formatDateKey } = ctx.__t;
const test = require("node:test");
const assert = require("node:assert/strict");

test("formatDateKey formata corretamente a data", () => {
    const d = new Date(2023, 4, 15); // 15 de maio de 2023
    assert.equal(formatDateKey(d), "2023-05-15");
});

test("getMonthData retorna array com dias corretos", () => {
    const days = getMonthData(2023, 0); // Janeiro 2023
    assert.equal(days.length >= 31, true);
    assert.equal(days[0], null); // Depende do dia da semana inicial
});