# merge-chapters-md

## The problem

You're writing a long markdown document with several chapters and you'd like the following workflow:

- Use a separate .md file for each chapter
- Merge chapters into a single .md file
- Optionaly:
  - Watch the files for changes and merge automatically
  - Add headers
  - Generate the output file in different formats using [Pandoc](https://pandoc.org/)
  - And more

## The solution

```bash
$ npm install -g merge-chapters-md
```

A zero-configuration command line program that is made to implememt the workflow described above. Let's see how it works.

Imagine you have the following setup:

```
~/Documents/Don't\ Look\ Back\ in\ Anger/
├── ch1
│   └── ch1.md
└── ch2
    └── ch2.md
```

Here's `ch1.md`:

```
Slip inside the eye of your mind
Don't you know you might find
A better place to play?
```

And `ch2.md`:

```
And so, Sally can wait
She knows it's too late as we're walking on by
```

Now, if you run `merge-chapters-md` in this folder, you'll get the following result:

```
.
├── Don't\ Look\ Back\ in\ Anger.md
├── ch1
│   └── ch1.md
└── ch2
    └── ch2.md
```

And the contetns of `Don't Look Back in Anger.md` are:

```
# Don't Look Back in Anger


Slip inside the eye of your mind
Don't you know you might find
A better place to play?

And so, Sally can wait
She knows it's too late as we're walking on by
```

This is shaping out to be a shoo-in hit!

## Configuration options

The following flags are available:

```
-d, --directory                       Specify a custom directory. Defaults to the current directory
-t, --title                           Specify a custom title. Defaults to the name basename of the directory
-f, --finalFolder, --final-folder     Specify where to put the output file. Defaults to the directory
-a, --addHeaders, --add-headers       A boolean flag. If set, adds an H2 header to the beggining of every chapters. The header is the number of the chapter. Defaults to false
-s, --subtitle                         Specify a path to an .md file, the contents of which will be used as a subtitle. Defaults to null
-p, --pandocFromat, --pandoc-format   A comma separated list of pandoc output formats (pdf is not supported). Requires pandoc to be installed and available in your PATH. Defaults to null
-w, --watch                           A boolean flag. If set, watches the directory for changes and merges automatically. Defaults to false
-i, --watchInterval, --watch-interval Specify an interval in ms to wait before merging automatically on change. Defaults to 1000
-c, --config                          Specify a path to a custom config file. It should be a JSON file where keys are any of the flags described above. Note that flags provied directly will override those present in the config file
```

## Usage

`merge-chapters-md` expects

- the chapter folders and chapter files to end in numbers
- chapter files to have the .md extension

## Examples

Once again, here's our setup:

```
~/Documents/Don't\ Look\ Back\ in\ Anger/
├── ch1
│   └── ch1.md
└── ch2
    └── ch2.md
```

### Title

```bash
$ merge-chapters-md -t "Please Do Look Back In Anger"
```

Output:

```
.
├── Please\ Do\ Look\ Back\ In\ Anger.md
├── ch1
│   └── ch1.md
└── ch2
    └── ch2.md
```

`Please Do Look Back In Anger.md`:

```
# Please Do Look Back In Anger


Slip inside the eye of your mind
Don't you know you might find
A better place to play?

And so, Sally can wait
She knows it's too late as we're walking on by
```

### Final folder

```bash
$ merge-chapters-md -f output
```

Output:

```
.
├── ch1
│   └── ch1.md
├── ch2
│   └── ch2.md
└── output
    └── Don't\ Look\ Back\ in\ Anger.md
```

### Add headers

```bash
$ merge-chapters-md -a
```

Output:

```
.
├── Don't\ Look\ Back\ in\ Anger.md
├── ch1
│   └── ch1.md
└── ch2
    └── ch2.md
```

`Don't Look Back in Anger.md`:

```
# Don't Look Back in Anger


## 1
Slip inside the eye of your mind
Don't you know you might find
A better place to play?

## 2
And so, Sally can wait
She knows it's too late as we're walking on by
```

### Subtitle

```bash
$ merge-chapters-md -s subtitle.md
```

`subtitle.md`:

```
_by Oasis_
```

Output:

```
.
├── Don't\ Look\ Back\ in\ Anger.md
├── ch1
│   └── ch1.md
├── ch2
│   └── ch2.md
└── subtitle.md
```

`Don't Look Back in Anger.md`:

```
# Don't Look Back in Anger
_by Oasis_


Slip inside the eye of your mind
Don't you know you might find
A better place to play?

And so, Sally can wait
She knows it's too late as we're walking on by
```

### Pandoc format

```bash
$ merge-chapters-md -p html,docx
```

Output:

```
.
├── Don't\ Look\ Back\ in\ Anger.docx
├── Don't\ Look\ Back\ in\ Anger.html
├── Don't\ Look\ Back\ in\ Anger.md
├── ch1
│   └── ch1.md
└── ch2
    └── ch2.md
```
