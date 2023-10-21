import jsonwebtoken from 'jsonwebtoken'

import users from './repository/user'

const getUser = async (token) => {
  const bearerLength = "Bearer ".length;
  if (token && token.length > bearerLength) {
    token = token.slice(bearerLength);
    const { ok, result } = await new Promise(resolve =>
      jsonwebtoken.verify(token, process.env.JWT_SECRET, (err, result) => {
        if (err) {
          resolve({
            ok: false,
            result: err
          });
        } else {
          resolve({
            ok: true,
            result
          });
        }
      })
    );
    if (ok) {
      const user = await users.findById(result.id)
      return user
    } else {
      console.log(result)
    }
  }

  return null
}

const userAuthorized = function(roles, user) {
  if(!user || !user.roles)
    return false

  let authorized = false
  
  if (roles) {
    roles.forEach(role => {
      if(user.roles.includes(role))
        authorized = true
    });

  }
  return authorized
}

export async function authContext(headers) {
  const user = await getUser(headers.authorization)
  
  return {
    user,
    isAuthorized: function isAuthorized(roles) {
      return userAuthorized(roles, user)
    }
  };
};