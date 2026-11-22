const vm = require("node:vm");
const fs = require("node:fs");
const path = require("node:path");

const ctx = vm.createContext({ console });
vm.runInContext(fs.readFileSync(path.join(__dirname, "time-theme.js"), "utf8") + "\n;globalThis.__t = { isDayTime };", ctx);

const { isDayTime } = ctx.__t;
const test = require("node:test");
const assert = require("node:assert/strict");

test("isDayTime retorna true para horário diurno", () => {
    const d = new Date();
    d.setHours(10, 0, 0);
    assert.equal(isDayTime(d), true);
});

test("isDayTime retorna false para horário noturno", () => {
    const d = new Date();
    d.setHours(22, 0, 0);
    assert.equal(isDayTime(d), false);
});

test("isDayTime caso de borda 6h (manhã)", () => {
    const d = new Date();
    d.setHours(6, 0, 0);
    assert.equal(isDayTime(d), true);
});

test("isDayTime caso de borda 18h (noite)", () => {
    const d = new Date();
    d.setHours(18, 0, 0);
    assert.equal(isDayTime(d), false);
});