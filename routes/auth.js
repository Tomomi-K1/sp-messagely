const express = require("express");
const router = new express.Router();
const { SECRET_KEY } = require("../config");
const User = require("../models/user");
const ExpressError = require("../expressError");
const jwt = require("jsonwebtoken");

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post('/login', async (req, res, next) => {
    try{
        const {username, password} = req.body;
        const result = await User.authenticate(username, password);
        if(result){
            User.updateLoginTimestamp(username);
            let token =jwt.sign({username:req.body.username}, SECRET_KEY) 
            return res.json({token});
        }
        throw new ExpressError('Invald username/password', 400);

    } catch(e){
        return next(e);
    }
})


/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */
router.post('/register', async (req, res, next) => {
    try{
        const results = await User.register(req.body);
        // you can destructure the above code as :
        // let {username} = await User.register(req.body);
        let token =jwt.sign({username:req.body.username}, SECRET_KEY);
        User.updateLoginTimestamp(req.body.username)
        return res.json({token});
    } catch(e){
        return next(e);
    }
})



module.exports = router;