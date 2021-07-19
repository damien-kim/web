import passport from 'passport';
import * as _LocalStrategy from 'passport-local'
import { dbId, dbUser } from './dB.mjs'
let LocalStrategy = _LocalStrategy.Strategy;

import bcrypt from 'bcrypt';
const saltRounds = 10;

// Passport module
export default function (app) {

    app.use(passport.initialize());
    app.use(passport.session()); // Integrate with Express framework

    passport.serializeUser(function (user, done) { // in case with auth success
        done(null, user.id);
        // done(null, user.id);
    });

    passport.deserializeUser(function (id, done) { // to check whether it's auth'd user
        let user = dbId(id);
        done(null, user);
    });

    passport.use(new LocalStrategy( // validate login
        {
            usernameField: 'email',
            passwordField: 'pwd'
        },
        function (email, password, done) {
            console.log('LocalStrategy', email, password);
            // let user = dbUser(email, password);
            let user = dbUser(email);
            console.log(user);
            if (user) {
                bcrypt.compare(password, user.password, function (err, result) {
                    if (result) {
                        return done(null, user, { message: 'Welcome!!' });
                    } else {
                        return done(null, false, { message: 'Incorrect credential' });
                    }
                });

            } else {
                return done(null, false, {
                    message: 'There is no email.'
                });
            }
        }
    ));
    return passport;
}
