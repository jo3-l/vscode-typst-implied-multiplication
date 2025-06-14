# `vscode-typst-implied-multiplication`

Recently, I've been evaluating Typst as an alternative to LaTeX. In general, the experience has been quite positive! However, one thing I miss from LaTeX is implied multiplication: in LaTeX, one can write `abc` for the product of three variables `a`, `b`, `c`. In Typst, on the other hand, one must write `a b c` instead, since `abc` could refer to the variable `abc`; the spaces are required to disambiguate.

While this design decision is defensible, my muscle memory is too used to implied multiplication, and I often find myself adding in spaces after the fact. Hence:

**This VS Code extension contributes a command that automatically fixes implied multiplication errors in the lines surrounding the cursor in Typst files. For instance, it will replace `A_(ij)`with`A_(i j)`, assuming that there is no variable named `ij` defined.**

The command is bound to the shortcut <kbd>Ctrl</kbd>+<kbd>M</kbd> <kbd>Ctrl</kbd>+<kbd>M</kbd> by default.

Will this extension actually save any time? Will I end up using it? Time will tell...

## Installation

This extension has not been released to the VS Code Marketplace, and probably never will be. To install it locally, clone this repository, run `pnpm install`, and then invoke the `./install` shell script.

The [Tinymist](https://github.com/Myriad-Dreamin/tinymist) extension for Typst must also be installed, as this extension relies on diagnostics from Tinymist to detect implied multiplication errors.

## Limitations

- Only fixes one error at a time, since Tinymist seems to only display the first error in any given file. It might be possible to fix this with a much more sophisticated integration with the Typst compiler.

## License

MIT
