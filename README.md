# XReport PDF Reports

XReport is a nodejs library for making PDF reports using headless chrome, [puppeteer](https://www.npmjs.com/package/puppeteer), [html-pdf-chrome](https://www.npmjs.com/package/html-pdf-chrome) and [ejs](https://www.npmjs.com/package/ejs).
I built this to make easier to build big reports and keep everything organized and concerns separated.

## Installation

Use the package manager [npm](https://www.npmjs.com/) to install xreport.

```bash
npm install --save xreport
```

## Usage

Each report should have some structure like the next, inside report folder, where `template.js` is the file that exports the instance of the report template, instance of `XTemplate`.

```bash
ROOT.
|   index.js
|
\---report
    |   main.ejs
    |   template.js
    |
    +---adapters
    |       adapter.js
    |
    \---pages
            header.ejs
            page1.ejs
            page2.ejs
```
The `template.js` file looks like , `XTemplate` is in charge of mixing the main template with it children templates:

```javascript
const { XTemplate } = require('xreport');

module.exports = new XTemplate({
    // Pointing at the main report file,
    // this main file will normally require other
    // templates.
    main: './main.ejs',

    // This is required to know the relative
    // path.
    dirname: __dirname,

    // Here you can place your data adapter 
    // instances.
    adapters: [
        require('./adapters/adapter')
    ]
});
```
Here the templates of the report, `main.js` is pointed from 
`template.js` and `main.ejs` requires `page1.ejs` and `page2.ejs`, and at the same time children templates(`page1.ejs` and `page2.ejs`) requires `header.ejs`.

```html
<!-- main.ejs -->
<div class="book">
    <!-- This means the content of page1.ejs
    will be appended here. -->
    {{./pages/page1.ejs}}
    <!-- Content of page2.ejs will be 
    appended here -->
    {{./pages/page2.ejs}}
</div>

<!-- ./pages/page1.ejs -->
<div class="page">
    <!-- header.ejs content will be appended here. -->
    {{./header.ejs}}
    <!-- Value of prop1 will be printed here, see ejs
    for more information. -->
    <%= prop1 %>
</div>

<!-- ./pages/page2.ejs -->
<div class="page">
    {{./header.ejs}}
    <%= prop2 %>
</div>

<!-- ./pages/header.ejs -->
<div class="header">My header</div>
```
Data adapter will allow us to transform data and also deal with async 
operations, data adapters are instances of `XDataAdapter`.
```javascript
const { XDataAdapter } = require('xreport');
// To return an observable of a value
const { of } = require('rxjs');

// We need to export an instance
// of data adapter and send it to 
// the render method.
module.exports = new XDataAdapter({
    // This defines the property path in the data object
    // that will be rendered into the report and replace the 
    // variables in report template.
    // '.' means object will be merged into the root object
    // of data.
    path:'.',

    // This is the method in charge of returning an 
    // observable(for async operations) of data that 
    // will be appended into the report. The source 
    // variable is the source be passed to the render 
    // method.
    adapter: (source) => of({
        prop1: 'Hola',
        // source.prop2 is setted in render method, this could be data or
        // db instance, etc...
        prop2: source.prop2
    })
});
```
And finally the render method.

```javascript
const { xreport } = require('xreport');

xreport.renderPdfReport(
    // XTemplate instance sent it 
    // to render method.
    require('./report/template'),
    // Source of data, remember 
    // it could be whatever.
    {
        prop2: 'Mundo' // this is used in adapter file.
    }
).subscribe((pdf) => {
    // Use the function you need with this PDF
    // result.
    pdf.toBase64();
    pdf.toBuffer();
    pdf.toFile('example.pdf');
    pdf.toStream();
});
```
## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)