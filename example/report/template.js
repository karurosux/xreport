const { XTemplate } = require('../../');

module.exports = new XTemplate({
    main: './main.ejs',
    dirname: __dirname,
    adapters: [
        require('./adapters/adapter')
    ]
});