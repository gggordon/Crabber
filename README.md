# Crabber

Content Grabbing Made Easy!

Crabber allows you to quickly grab content from external websites into a container specified by you.

## Demo
[http://gggordon.github.io/Crabber/](http://gggordon.github.io/Crabber/)

## Dependencies
| jQuery > 1.11

## Getting Started

Use npm

    npm install --save crabber

Use bower

    bower install --save crabber

or Download minified script and stylesheet from GitHub

    https://raw.githubusercontent.com/gggordon/Crabber/master/crabber.js
    https://raw.githubusercontent.com/gggordon/Crabber/master/crabber.css

Then Include in html file

    <script type="text/javascript" src="crabber.min.js"></script>

You may then include the default stylesheet, feel free to add your own styles

    <link rel="stylesheet" type="text/javascript" href="crabber.css" />


## Usage

```
    <script type="text/javascript">
    var options = {
        appendContent:true, //append new content to end of html element. Optional. Defaults to true
        descWordCount:25, //Max word count in description. Optional. Defaults to 20
        viewNode:'.selector' //jquery selector/html node to display grabbed content in. Optional. Defaults to creating new node
    };
    $('#myTextNode').crabber(options);
    </script>
```

## Enjoy

Enjoy this project and if you have any issues feel free to state them here on github or contribute. 

## MIT License
