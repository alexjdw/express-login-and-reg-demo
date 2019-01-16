const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const flash = require('connect-flash');
const db = require('./db.js');
const validations = require('./validations.js')

app = express();
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'a super secret secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));
app.use(flash());


app.get('/', function(request, response) {
    var context = {};
    var errors = request.session.errors;
    var formdata = request.session.formdata;
    delete request.session.errors;
    delete request.session.formdata;
    if (errors) {
        if (errors.regform) {
            context.regform = errors.regform;
        } else if (errors.logform) {
            context.logform = errors.logform
        }
    }
    if (formdata) {
        for (item in formdata) {
            context[item] = formdata[item];
        }
    }
    
    var required = ['username', 'email', 'lemail'];
    for (item in required) {
        if (!context[required[item]]) context[required[item]] = '';
    }

    context.messages = request.flash('error');
    console.log(context.messages)
    response.render('index', context);
});

app.get('/home', function(request, response) {
    console.log(request.session.user);
    if (!request.session.user) {
        response.redirect('/');
    }
    db.User.findById(request.session.user, function(error, user) {
        console.log("Found:", user)
        if (error) {
            request.flash('error', error.errmsg);
            response.redirect('/');
        } else {
            var context = {};
            context.user = user;
            context.messages = request.flash('error');
            response.render('home', context);
        }
    });
});

app.post('/login', function(request, response) {
    console.log(request.body);
    var context = {}
    request.session.formdata = {lemail: request.body.lemail};

    db.User.findOne({email: request.body.lemail}, function (error, user) {
        console.log("---", error, user);
        if (error) {
            request.flash('error', error.errmsg);
            response.redirect('/');
        }
        else if (!user) {
            request.flash('error', "User with email " + request.body.lemail + " not found.");
            response.redirect('/');
        } else if (bcrypt.compare(request.body.password, user.pw_hash)) {
            request.session.user = user._id;
            response.redirect('/home');
        } else {
            request.flash('error', "Invalid password.");
            response.redirect('/');
        }
    })
});

app.post('/register', function(request, response) {
    let valid = validations.validate_registration(request.body);
    if (!valid.valid) {
        request.session.errors = valid.errors;
        request.session.formdata = {
            email: request.body.email,
            username: request.body.username
        }
        response.redirect('/')
    } else {
        let password = bcrypt.hash(request.body.password, 10)
            .then(function(hashed_pw) {
                db.User.create({
                    username: request.body.username,
                    email: request.body.email,
                    pw_hash: hashed_pw
                }, function(error, user) {
                    if (error) {
                        request.flash('error', error.errmsg);
                        response.redirect('/');
                    } else {
                        request.session.user = user._id;
                        response.redirect('/home');
                    }
                });
            }).catch(function(error) {
                request.flash('error', error.errmsg);
                response.redirect('/');
            });
    }
});

app.get('/logout', function(request, response) {
    delete request.session.user;
    response.redirect('/')
});

app.post('/login', function(request, response) {
    response.redirect('/home')
});
app.listen(5000);