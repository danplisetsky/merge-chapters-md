#!/usr/bin/env node

//#region REQUIRE
const minimist = require("minimist");
const fs = require("fs");
const path = require("path");
const pandoc = require("node-pandoc");
const chokidar = require("chokidar");
const debounce = require("debounce");
const chalk = require("chalk");
//#endregion

function processArgs(argv) {
  const parsedArgs = minimist(argv, {
    alias: {
      title: "t",
      directory: "d",
      "final-folder": ["ff", "finalFolder"],
      "pandoc-format": ["pf", "pandocFormat"],
      watch: "w",
      "watch-interval": ["wi", "watchInterval"],
      "add-headers": ["ah", "addHeaders"],
      config: "c"
    }
  });

  let finalArgs;
  if (parsedArgs.config) {
    let config = JSON.parse(fs.readFileSync(parsedArgs.config).toString());
    finalArgs = Object.assign({}, config, parsedArgs);
  } else {
    finalArgs = parsedArgs;
  }

  return finalArgs;
}

function getChapterDirs(directory) {
  try {
    return fs
      .readdirSync(directory)
      .filter(
        item =>
          /\d+$/.test(item) &&
          fs.statSync(path.join(directory, item)).isDirectory()
      );
  } catch (error) {
    throw new Error(chalk.yellow(directory) + ": No such directory");
  }
}

function mergeChapters(
  title,
  directory,
  finalFolder,
  pandocFormat,
  addHeaders
) {
  // Read all the folders in the provided directory
  // whose names end with digit(s)

  try {
    const chapterDirs = getChapterDirs(directory);

    // Get a consecutive list of all .md files we'll need to merge
    /** @type{Array<string>} */
    const chapterFiles = chapterDirs.flatMap(dir => {
      const files = fs.readdirSync(dir);
      return files.filter(f => /md$/.test(f)).map(f => path.join(dir, f));
    });

    // Map the .md files to their content and add headers
    const chapterContents = chapterFiles.map(ch => {
      const header = addHeaders ? "## " + ch.match(/(\d+)\.md$/)[1] + "\n" : "";
      return header + fs.readFileSync(ch).toString();
    });

    const finalVersionMarkdown =
      "# " + title + "\n\n" + chapterContents.join("\n");
    if (!fs.existsSync(finalFolder)) {
      fs.mkdirSync(finalFolder, { recursive: true });
    }
    fs.writeFileSync(
      path.join(finalFolder, title + ".md"),
      finalVersionMarkdown
    );

    if (pandocFormat) {
      /** @type {string} */ (pandocFormat).split(",").forEach(pf => {
        const tempPandocFile = "__temp" + pf;
        const panodcArgs = `-f markdown -t ${pf} -o ` + tempPandocFile;

        pandoc(finalVersionMarkdown, panodcArgs, (error, _result) => {
          if (error) return;

          fs.renameSync(
            tempPandocFile,
            path.join(finalFolder, title + "." + pf)
          );
        });
      });
    }

    console.log(chalk.green("success"));
  } catch (error) {
    console.log(chalk.red("failure: "), error.message, error.stack);
    process.exit(1);
  }
}

function main() {
  const {
    title = path.basename(process.cwd()),
    directory = process.cwd(),
    finalFolder = process.cwd(),
    pandocFormat = null,
    addHeaders = false,
    watch = false,
    watchInterval = 1000
  } = processArgs(process.argv.slice(2));

  if (watch) {
    const watcher = chokidar.watch(directory, {
      // ignore .dotfiles and the final folder output
      ignored: [/(^|[\/\\])\../, `${path.join(finalFolder, title)}*`]
    });
    const debouncedMergeChapters = debounce(
      mergeChapters,
      watchInterval,
      false
    );
    watcher.on("all", (_event, _path) => {
      debouncedMergeChapters(
        title,
        directory,
        finalFolder,
        pandocFormat,
        addHeaders
      );
    });
  } else {
    mergeChapters(title, directory, finalFolder, pandocFormat, addHeaders);
  }
}

main();
