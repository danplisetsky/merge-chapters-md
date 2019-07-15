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
      subtitle: "s",
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

function readSubtitleFile(path) {
  try {
    return fs.readFileSync(path).toString();
  } catch (error) {
    throw new Error("Error reading the subtitle file: " + chalk.yellow(path));
  }
}

function mergeChapters(
  title,
  directory,
  finalFolder,
  pandocFormat,
  addHeaders,
  subtitle
) {
  // Read all the folders in the provided directory
  // whose names end with digit(s)

  try {
    const chapterDirs = getChapterDirs(directory);

    if (chapterDirs && chapterDirs.length === 0) {
      throw new Error("no chapter directories found");
    }

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

    // Read the subtitle file, if exists
    const subtitleContent = subtitle ? readSubtitleFile(subtitle) : "";

    const finalVersionMarkdown =
      "# " +
      title +
      "\n" +
      subtitleContent +
      "\n\n" +
      chapterContents.join("\n");
    if (!fs.existsSync(finalFolder)) {
      fs.mkdirSync(finalFolder, { recursive: true });
    }
    const finalPath = path.join(finalFolder, title + ".md");
    fs.writeFileSync(finalPath, finalVersionMarkdown);

    console.log(chalk.green("success: ") + `wrote ${finalPath}`);

    if (pandocFormat) {
      /** @type {string} */ (pandocFormat).split(",").forEach(pf => {
        const tempPandocFile = "__temp" + pf;
        const panodcArgs = `-f markdown -t ${pf} -o ` + tempPandocFile;

        pandoc(finalVersionMarkdown, panodcArgs, (error, _result) => {
          if (error) return;

          const finalPath = path.join(finalFolder, title + "." + pf);
          fs.renameSync(tempPandocFile, finalPath);
          console.log(chalk.green("success: ") + `wrote ${finalPath}`);
        });
      });
    }
  } catch (error) {
    console.log(chalk.red("failure: "), error.message);
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
    watchInterval = 1000,
    subtitle = null
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
        addHeaders,
        subtitle
      );
    });
  } else {
    mergeChapters(
      title,
      directory,
      finalFolder,
      pandocFormat,
      addHeaders,
      subtitle
    );
  }
}

main();
