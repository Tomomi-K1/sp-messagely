const express = require("express");
const router = new express.Router();
const User = require("../models/user");
const ExpressError = require("../expressError");

/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/
router.get('/', async (req, res, next) => {
    try{
        const results=await User.all()
        return res.json(results)
    } catch (e){
        return next(e);
    }
})


/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/
router.get('/:username', async (req, res, next) => {
    try{
        const {username}=req.params;
        console.log(username);
        const results = await User.get(username);
        return res.json({"user":results})
    } catch(e){
        return next(e);
    }
})

/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get('/:username/to', async (req, res, next) => {
    try{
        const {username}=req.params;
        const msgs = await User.messagesTo(username);
        return res.json({"messages":msgs})
    } catch(e){
        return next(e);
    }
})


/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get('/:username/from', async (req, res, next) => {
    try{
        const {username}=req.params;
        const msgs = await User.messagesFrom(username);
        return res.json({"messages":msgs})
    } catch(e){
        return next(e);
    }
})

module.exports = router;