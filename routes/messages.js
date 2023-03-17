const express = require("express");
const router = new express.Router();
const User = require("../models/user");
const ExpressError = require("../expressError");
const Message = require("../models/message");


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
router.get('/:id', async (req, res, next) => {
    try{
       const {id} = req.params;
       const msg = await Message.get(id); 
       console.log(msg.to_user.username);
    //    if(msg.to_user.username !== req.user.username || msg.from_user.username !== req.user.username){
    //     throw new ExpressError("Not allowed", 400);
    //    }
       return res.json(msg);
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
router.post('/', async (req, res, next) => {
    try{
        req.body.from_username=req.user.username;
        console.log(req.body);
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


module.exports = router;

