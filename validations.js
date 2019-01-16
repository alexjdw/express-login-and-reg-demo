module.exports.validate_registration = function(body) {
    let valid = true;
    let errors = {
        username: [],
        email: [],
        password: [],
        };
    if (body.username.length < 5) {
        valid = false;
        errors.username.push("Username should be 5 or more characters.");
    }
    if (body.username.length > 25) {
        valid = false;
        errors.username.push("Username should be 5 or more characters.");
    }
    if (!/[a-zA-Z0-9.]+\@[a-zA-Z0-9.]+\.[a-zA-Z0-9]+/.test(body.email)) {
        valid = false;
        errors.email.push("Email must be a valid email.");
    }
    
    var pwreg = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
    if (body.password.length < 8
        || body.password.toLowerCase() === body.password
        || !pwreg.test(body.password)) {
        valid = false;
        errors.password.push("Password must be at least 8 characters, include a number and uppercase character, and include a punctuation character.");
    }
    if (body.password != body.confirm) {
        valid = false;
        errors.password.push("Password should match the confirmation field.")
    }
    return { valid: valid, errors: {regform: errors}}
}