describe("cli", function() {
  const fs = require("fs");
  const path = require("path");
  const tmp = require("tmp");
  const spawnAsync = require("@expo/spawn-async");

  const ch0 = `
  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec dapibus vulputate viverra. Duis egestas nulla pretium aliquet pharetra. Donec quis.
  `;

  const ch1 = `
  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam nec ante vel mi vehicula maximus. Nulla dictum faucibus lacus, vitae.
  `;

  beforeEach(function() {
    const tmpdir = (this.tmpdir = tmp.dirSync({
      unsafeCleanup: true
    }));

    const ch0dir = (this.ch0dir = path.join(tmpdir.name, "ch0"));
    const ch1dir = (this.ch1dir = path.join(tmpdir.name, "ch1"));
    fs.mkdirSync(ch0dir);
    fs.mkdirSync(ch1dir);

    const ch0md = (this.ch0md = path.join(ch0dir, "ch0.md"));
    const ch1md = (this.ch1md = path.join(ch1dir, "ch1.md"));
    fs.writeFileSync(ch0md, ch0);
    fs.writeFileSync(ch1md, ch1);

    this.tmpdirEmpty = tmp.dirSync();
  });

  afterEach(function() {
    this.tmpdir.removeCallback();
    this.tmpdirEmpty.removeCallback();
  });

  it("empty directory, no params", async function() {
    let resultPromise = spawnAsync("merge-chapters-md", [], {
      cwd: this.tmpdirEmpty.name
    });
    try {
      await resultPromise;
    } catch (error) {
      const { stdout } = error;
      expect(stdout.startsWith("failure")).toBe(true);
    }
  });
});
