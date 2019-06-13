const { xreport } = require('../');

xreport.renderPdfReport(
    // XTemplate instance sent it 
    // to render method.
    require('./report/template'),
    // Source of data, remember 
    // it could be whatever.
    {
        prop2: 'Mundo'
    }
).subscribe((pdf) => {
    // Use the function you need with this PDF
    // result
    pdf.toBase64();
    pdf.toBuffer();
    pdf.toFile('example.pdf');
    pdf.toStream();
});