// const express = require("express");
const router = new express.Router();
const User = require("../models/user");
const ExpressError = require("../expressError");
const Message = require("../models/message");
const {ensureLoggedIn} = require('../middleware/auth')


/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get('/:id', ensureLoggedIn, async (req, res, next) => {
    try{
       const {id} = req.params;
       const msg = await Message.get(id); 

       if(msg.to_user.username == req.user.username || msg.from_user.username == req.user.username){
        return res.json(msg);
       }
       throw new ExpressError("Not allowed", 400);
    } catch(e){
        return next(e);
    }
})


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post('/', ensureLoggedIn, async (req, res, next) => {
    try{
        req.body.from_username=req.user.username;
        const msg = await Message.create(req.body);
        return res.json({"message": msg});
    } catch(e){
        return next(e);
    }
})

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/
router.post('/:id/read', ensureLoggedIn, async (req, res, next) => {
    try{
        const {id} = req.params;
        const msg = await Message.get(id);
        if(req.user.username === msg.to_user.username ){
            const results =await Message.markRead(id);
            return res.json({"message": results});
        }
        throw new ExpressError('Not authorized', 400);
        
    } catch(e){
        return next(e);
    }
} )


module.exports = router;

