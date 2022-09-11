# Introduction


Cockpit provides a command line tool called `tower` to make a developer's job easier and more enjoyable.

## Usage

Cwd to Cockpits root folder and run the command `./tower list` to see a list of available commands.

```
./tower list

  _|_|_|                      _|                  _|    _|
_|          _|_|      _|_|_|  _|  _|    _|_|_|        _|_|_|_|
_|        _|    _|  _|        _|_|      _|    _|  _|    _|
_|        _|    _|  _|        _|  _|    _|    _|  _|    _|
  _|_|_|    _|_|      _|_|_|  _|    _|  _|_|_|    _|      _|_|
                                        _|
                                        _|

_|_|_|_|_|
    _|      _|_|    _|      _|      _|    _|_|    _|  _|_|
    _|    _|    _|  _|      _|      _|  _|_|_|_|  _|_|
    _|    _|    _|    _|  _|  _|  _|    _|        _|
    _|      _|_|        _|      _|        _|_|_|  _|


Cockpit Tower 2.2.2

Usage:
  command [options] [arguments]

Options:
  -h, --help            Display help for the given command. When no command is given display help for the list command
  -q, --quiet           Do not output any message
  -V, --version         Display this application version
      --ansi|--no-ansi  Force (or disable --no-ansi) ANSI output
  -n, --no-interaction  Do not ask any interactive question
  -v|vv|vvv, --verbose  Increase the verbosity of messages: 1 for normal output, 2 for more verbose output and 3 for debug

Available commands:
  completion         Dump the shell completion script
  help               Display help for a command
  list               List commands
 app
  app:cache:flush
  app:i18n:create
  app:update
```

## Commands

** `app:cache:flush` **

Clear any cached data

---

** `app:i18n:create` **

Create translation files for Cockpits admin ui for a specific locale

```
./tower app:i18n:create de
```

Find the generated translation files in `config/i18n`

---

** `app:update` **

This command updates Cockpit to the latest core or pro version:

```
./tower app:update core
```

```
./tower app:update pro
```