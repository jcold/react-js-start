
var Header = require('./components/header/header.js');
var Footer = require('./components/footer/footer.js');

React.render(<Header />, document.getElementById("header"));

React.render(<Footer />, $("#footer")[0]);
