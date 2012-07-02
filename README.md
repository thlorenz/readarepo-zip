**Table of Contents**  *generated with [DocToc](http://doctoc.herokuapp.com/)*

- [readarepo](#readarepo)
	- [What ](#what)
	- [How](#how)
	- [Install](#install)
	- [Run](#run)
		- [Convert a repository](#convert-a-repository)
		- [Convert a folder](#convert-a-folder)
	- [API](#api)

# readarepo

## What 

Convert a git repo into html pages to read anywhere.

## How

Given a repository url or a local folder, it will convert all files into syntax
highlighted `.html` files, while maintaining the original folder structure.

Finally it will create a zip file of all highlighted files which you can then
read on a reader like iPad, e.g., with
[GoodReader](http://itunes.apple.com/app/id363448914?mt=8)


## Install

Requires python to be [installed](http://www.python.org/getit/).
    
    npm install readarepo

## Run
    
### Convert a repository

Convert a github repository use `readarepo.js`.

Running it without parameters will print the following guide:

    > node ./readarepo.js

    Options:
    -u, --url          [required]
    -t, --target       [default: "./tmp"]
    -d, --directories  [default: "!.git,!node_modules"]
    -f, --files        
    -h, --highlighter  [default: "pygments"]
    -l, --loglevel     [default: "info"]

    Missing required arguments: u

As an example, in order to convert this repository you would do:

    node readarepo.js -u https://github.com/thlorenz/readarepo -d '!.git,!3rd' 

- `-d '!.git,!3rd'` makes sure we don't attempt to convert the '.git' folder or
the '3rd' which (contains a copy of the [pygments](http://pygments.org)
library.

- read more about file and directory filters on the [fsrec
repository](https://github.com/thlorenz/fsrec) since readarepo uses it under
the hood.

### Convert a folder

In order to convert all files found within a folder on your machine, use `readafolder.js`.

Running it without parameters will print the following guide:

    > node readafolder

    Options:
    -s, --source       [required]
    -t, --target       [default: "./tmp"]
    -d, --directories  [default: "!.git,!node_modules"]
    -f, --files        
    -h, --highlighter  [default: "pygments"]
    -l, --loglevel     [default: "info"]

    Missing required arguments: s

As an example, in order to convert folder './foo' (excluding '.svn' folders) and store it inside './foo_converted', you would do:

    node readafolder.js -s ./foo -t ./foo_converted -d '!.svn'

- filters work the same as explained above

## API

In order to support using **readarepo** as a service, it exposes all necessary
functions via the [service module](./readarepo/blob/master/lib/service.js).

As a guide on how to use it look inside
[readarepo.js](./readarepo/blob/master/readarepo.js) and
[readafolder.js](./readarepo/blob/master/readafolder.js).

Most functions take a function as last parameter which will be invoked once the task is complete.

Here is a list of the ones you may most likely use:

- convertFolder:  `function (rootPath, opts, convertedFolderCb)`
- cloneAndConvert: ` function (opts, clonedAndConvertedCb)`
- startPygmentsService: `function(cb)`
- stopPygmentsService: `function()`

For more information - *soon* - you may also look at the
[readarepo-web](https://github.com/thlorenz/readarepo-web) project which
leverages this API to expose **readarepo** as a service on the web.

