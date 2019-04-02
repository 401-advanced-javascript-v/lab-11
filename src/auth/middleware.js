'use strict';

const User = require('./users-model.js');

module.exports = (req, res, next) => {
/**
 * find header of the authstring
 */
  try {

    let [authType, authString] = req.headers.authorization.split(/\s+/);

    // BASIC Auth  ... Authorization:Basic ZnJlZDpzYW1wbGU=

    switch(authType.toLowerCase()) {
    case 'basic':
      return _authBasic(authString);
    default:
      return _authError();
    }

  } catch(e) {
    return _authError();
  }

  /**
 * translate buffered authstring into string
 * @param {*} authString 
 */
  function _authBasic(authString) {
    let base64Buffer = Buffer.from(authString,'base64'); // <Buffer 01 02...>
    let bufferString = base64Buffer.toString(); // john:mysecret
    let [username,password] = bufferString.split(':');  // variables username="john" and password="mysecret"
    let authObject = {username,password};  // {username:"john", password:"mysecret"}

    return User.authenticateBasic(authObject)
      .then( user => _authenticate(user) );
  }
  /**
 * making the query of user and password
 * @param {*} user 
 */
  function _authenticate(user) {
    if ( user ) {
      req.user = user;
      req.token = user.generateToken();
      next();
    }
    else {
      _authError();
    }
  }

  function _authError() {
    next({status: 401, statusMessage: 'Unauthorized', message: 'Invalid User ID/Password'});
  }

};

