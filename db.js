var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/users')

UserSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 25,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        validate: {
            validator: function(email) {
                return /[a-zA-Z0-9.]+\@[a-zA-Z0-9.]+\.[a-zA-Z0-9]+/.test(email);
            }
        },
        unique: true
    },
    pw_hash: {
        type: String,
        required: true,
        maxlength: 100
    },
    created_on: {
        type: Date,
        default: Date.now
    },
    updated_on: {
        type: Date,
        default: Date.now
    }
});

module.exports.User = mongoose.model('User', UserSchema);
module.exports.conn = mongoose;