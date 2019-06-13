const { XDataAdapter } = require('../../../');
const { of } = require('rxjs');

module.exports = new XDataAdapter({
    path:'.',
    adapter: (source) => of({
        prop1: 'Hola',
        prop2: source.prop2
    })
});