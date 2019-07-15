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

  const customTitle = "Little Known Ways to MERGE CHAPTERS";
  const subtitle = "_Cras tincidunt tellus turpis, sit_";

  beforeEach(function() {
    this.tmpdirEmpty = tmp.dirSync();

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

    const subtitlemd = (this.subtitlemd = path.join(
      tmpdir.name,
      "subtitle.md"
    ));
    fs.writeFileSync(subtitlemd, subtitle);

    this.defaultTitle = path.basename(tmpdir.name);
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

  it("directory with chapter directories, no params", async function() {
    let resultPromise = spawnAsync("merge-chapters-md", [], {
      cwd: this.tmpdir.name
    });
    let { stdout } = await resultPromise;

    const finalMd = "# " + this.defaultTitle + "\n\n\n" + ch0 + "\n" + ch1;
    const result = fs
      .readFileSync(path.join(this.tmpdir.name, this.defaultTitle + ".md"))
      .toString();

    expect(result).toEqual(finalMd);
    expect(
      stdout.startsWith("success") &&
        stdout.trim().endsWith(this.defaultTitle + ".md")
    ).toBe(true);
  });

  it("directory with chapter directories, w/ custom title", async function() {
    let resultPromise = spawnAsync("merge-chapters-md", ["-t", customTitle], {
      cwd: this.tmpdir.name
    });
    let { stdout } = await resultPromise;

    const finalMd = "# " + customTitle + "\n\n\n" + ch0 + "\n" + ch1;
    const result = fs
      .readFileSync(path.join(this.tmpdir.name, customTitle + ".md"))
      .toString();

    expect(result).toEqual(finalMd);
    expect(
      stdout.startsWith("success") &&
        stdout.trim().endsWith(customTitle + ".md")
    ).toBe(true);
  });

  it("directory with chapter directories, w/ subtitle", async function() {
    let resultPromise = spawnAsync(
      "merge-chapters-md",
      ["-s", this.subtitlemd],
      {
        cwd: this.tmpdir.name
      }
    );
    let { stdout } = await resultPromise;

    const finalMd =
      "# " + this.defaultTitle + "\n" + subtitle + "\n\n" + ch0 + "\n" + ch1;
    const result = fs
      .readFileSync(path.join(this.tmpdir.name, this.defaultTitle + ".md"))
      .toString();

    expect(result).toEqual(finalMd);
    expect(
      stdout.startsWith("success") &&
        stdout.trim().endsWith(this.defaultTitle + ".md")
    ).toBe(true);
  });

  it("directory with chapter directories, w/ custom directory", async function() {
    let resultPromise = spawnAsync("merge-chapters-md", [
      "-d",
      this.tmpdir.name
    ]);
    let { stdout } = await resultPromise;

    const finalMd = "# " + this.defaultTitle + "\n\n\n" + ch0 + "\n" + ch1;
    const result = fs
      .readFileSync(path.join(this.tmpdir.name, this.defaultTitle + ".md"))
      .toString();

    expect(result).toEqual(finalMd);
    expect(
      stdout.startsWith("success") &&
        stdout.trim().endsWith(this.defaultTitle + ".md")
    ).toBe(true);
  });

  it("directory with chapter directories, w/ custom final folder", async function() {
    let resultPromise = spawnAsync(
      "merge-chapters-md",
      ["-f", this.tmpdirEmpty.name],
      {
        cwd: this.tmpdir.name
      }
    );
    let { stdout } = await resultPromise;

    const finalMd = "# " + this.defaultTitle + "\n\n\n" + ch0 + "\n" + ch1;
    const result = fs
      .readFileSync(path.join(this.tmpdirEmpty.name, this.defaultTitle + ".md"))
      .toString();

    expect(result).toEqual(finalMd);
    expect(
      stdout.startsWith("success") &&
        stdout.trim().endsWith(this.defaultTitle + ".md")
    ).toBe(true);
  });
});
