require('./header.scss');
var imgSrc = require('./yeoman.png');

var Header = React.createClass({
    getInitialState: function () {
        return {
            img: imgSrc
        }
    },
    render: function () {
        return (
            <div className="reHeader">
                <h1><img src={imgSrc}/>Hi, Welcome webpack-starter, Nice</h1>
            </div>
        );
    }
});

module.exports = Header;
