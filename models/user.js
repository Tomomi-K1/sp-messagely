/** User class for message.ly */
const bcrypt = require('bcrypt');
const { BCRYPT_WORK_FACTOR } = require("../config");
const db = require("../db");
const ExpressError = require("../expressError");


/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}   */
  static async register({username, password, first_name, last_name, phone}) {
      const hashedPw = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
      const curTime = new Date();
      const results = await db.query(
        `INSERT INTO users (username, password, first_name, last_name, phone, join_at, last_login_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING username, password, first_name, last_name, phone`, [username, hashedPw, first_name, last_name, phone, curTime, curTime]
      )
      return results.rows[0];
   }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) { 
     const results = await db.query(
      `SELECT password FROM users
       WHERE username =$1`, [username]
     );
     const user = results.rows[0];
     if(user){
        return await bcrypt.compare(password, user.password);
     }
     throw new ExpressError('Invalid username/password', 400)
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) { 
     const loginTime = new Date();
     await db.query(
      `UPDATE users SET last_login_at =$1
       WHERE username =$2`, [loginTime, username]
     )
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {
    console.log('getAll')
    const results = await db.query(
      `SELECT username, first_name, last_name, phone 
      FROM users`);
      console.log(results.rows)
    return results.rows
  }
  
  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const results = await db.query(
      `SELECT username, first_name, last_name, phone, join_at, last_login_at
       FROM users
       WHERE username = $1`, [username]
    );
    if(results.rows.length ===0){
      throw new ExpressError(`Username ${username} not found`, 400);
    }
    return results.rows[0];
   }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
      const results = await db.query(
        `SELECT 
        m.id,
        m.to_username,
        m.body,
        m.sent_at,
        m.read_at,
        u.username,
        u.first_name,
        u.last_name,
        u.phone      
        FROM messages AS m
        JOIN users AS u ON m.to_username = u.username
        WHERE m.from_username = $1`,[username])
      
      // error handling
      if(results.rows.length===0){
        throw new ExpressError(`there is not msg sent by ${username}`, 400);
      }
      
      const msgs =results.rows.map(r =>({
          id:r.id,
          to_user: {
            username: r.username,
            first_name:r.first_name,
            last_name: r.last_name,
            phone: r.phone 
          },
          body: r.body,
          sent_at: r.sent_at,
          read_at: r.read_at
        }));
        return msgs;
   }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) { 
    const results = await db.query(
      `SELECT 
      m.id,
      m.from_username,
      m.body,
      m.sent_at,
      m.read_at,
      u.username,
      u.first_name,
      u.last_name,
      u.phone
      FROM messages AS m
      JOIN users AS u ON m.from_username = u.username
      WHERE m.to_username = $1`,[username])

    if(results.rows.length===0){
        throw new ExpressError(`there is not msg to ${username}`, 400);
    }

    const msgs =results.rows.map(r =>({
      id:r.id,
      from_user: {
        username: r.username,
        first_name:r.first_name,
        last_name: r.last_name,
        phone: r.phone 
      },
      body: r.body,
      sent_at: r.sent_at,
      read_at: r.read_at
    }));
    return msgs;
  }
}


module.exports = User;