const express = require('express');
const handlebars = require('express-handlebars')
const path = require('path');
const bodyParser = require('body-parser');
var cookieParser = require("cookie-parser");

const app = express();
const session = require('express-session')
const flush = require('connect-flash')
app.use(cookieParser());


app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())
app.use(session({
    key: "user_sid",
    secret: 'some secret',
    cookie: { maxAge: 3600000 }, // Time for cookie to expire in milliseconds 3600000 ms = 60 minutes
    resave: false,
    saveUninitialized: false
}))


app.use(flush());

const hb_inst = handlebars.create({
    extname: '.handlebars',
    compilerOptions: {
        preventIndent: true
    },
    layoutsDir: path.join(__dirname, './views/layouts'),
    partialsDir: path.join(__dirname, './views/partials')
});

app.engine('handlebars', hb_inst.engine);

app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, './views/user'));


app.use(require('./routes/user'));


app.use('/', (req, res) => {
    res.redirect('/login')

})


app.listen(3500, () => {
    console.log('port working');
})