// Set up 
const express = require('express')
const bcrypt = require('bcrypt')
const bodyParser = require('body-parser')
const app = express()
const { Pool } = require('pg');
require('dotenv').config();
const db = require("./models");
db.sequelize.sync();
const { Op } = require("sequelize");
var methodOverride = require('method-override');
var cors = require('cors');
const address = require('./models/address');
const { request } = require('express');
app.use(bodyParser.urlencoded({ 'extended': 'true' }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(cors());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'DELETE, POST, PUT');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const usersOfApp = db.User;
const autoPolicies = db.AutoPolicy;
const insuredAcct = db.InsuredAccount;
const insuredAddress = db.address;
const vehicle = db.Vehicle;
const coverage = db.Coverage;

const client = new Pool(
  {
    user: process.env.DB_USERNAME,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
  }
);
client.connect();



/**
 *  creates insured Accounts
 */
app.post('/api/insuredinfo', function (req, res) {
  if (!req.body.firstName) {
    res.status(400).send({
      message: "Some required fields are missing in the data, please verify"
    });
    return;
  }
  console.log("create insured");
  // Create an account
  const addr = {
    line1: req.body.addrLine1,
    line2: req.body.addrLine2,
    city: req.body.city,
    state: req.body.state,
    zipCode: req.body.zip
  };
  const acc = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    gender: req.body.gender,
    dob: req.body.dob
  };

  // Save account in the database
  var insAcct = insuredAcct.create(acc).then(function (insAcct) {
    var addressOfAccount = insuredAddress.create({
      line1: req.body.addrLine1,
      line2: req.body.addrLine2,
      city: req.body.city,
      state: req.body.state,
      zipCode: req.body.zip,
      InsuredAccountId: insAcct.get('id')
    }
    );
    return addressOfAccount;
  })
    .then(data => {
      res.json(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "An error occurred while creating the Insured Account."
      });
    });
});

/**
 * created policy along with vehicles and coverages
 */
app.post('/api/newpolicy', function (req, res) {
  if (!req.body.policyNumber) {
    res.status(400).send({
      message: "Some required fields are missing in the data, please verify"
    });
    return;
  }
  console.log("create Policy");
  console.log(req.body.insuredAccount);
  console.log("received username ", req.body.uID);

  // Create an account
  const autoPolicyDet = {
    policyNumber: req.body.policyNumber,
    policyStart: req.body.policyStart,
    policyEnd: req.body.policyEnd,
    premium: req.body.premium,
    requireUWApprovalInd: req.body.requireUWApprovalInd,
    policyNumber: req.body.policyNumber,
    status: req.body.status,
    InsuredAccountId: req.body.insuredAccount,
    UserId: req.body.uID
  };

  // Save policy in the database
  var policy = autoPolicies.create(autoPolicyDet).then(function (policy) {
    policy.createVehicle({
      year: req.body.year,
      vin: req.body.vin,
      make: req.body.make,
      model: req.body.model,
      mileage: req.body.mileage,
    });
    policy.createCoverage({
      bodilyInjuryCovInd: req.body.bodilyInjuryCovInd,
      collisionCovInd: req.body.collisionCovInd,
      medPayCovInd: req.body.medPayCovInd,
      propertyDmgCovInd: req.body.propertyDmgCovInd,
      unCovInd: req.body.unCovInd,
      underInsCovInd: req.body.underInsCovInd,
    })
  }).then(data => {
    res.json(data);
  })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "An error occurred while creating the Insured Account."
      });
    });
});

//set UW decision
app.patch('/api/uwapproval', function (req, res) {
  console.log("aaa", req.body.id);
  console.log("bbb", req.body.isUWApprovedInd);
  console.log("ccc", req.body);

  autoPolicies.update(
    { isUWApprovedInd: req.body.isUWApprovedInd },
    { returning: true, where: { id: req.body.id } }
  ).then(data => {
    res.send(data);
  }).catch(err => {
    res.status(500).send({
      message:
        err.message || "An error occurred while retrieving accounts."
    });
  });
});

//Policies that require UW approval and are not yet approved or rejected
app.get('/api/uwapproval', function (req, res) {
  autoPolicies.findAll({
    where: {
      requireUWApprovalInd: { [Op.eq]: true },
      isUWApprovedInd: { [Op.is]: null }
    }
  }).then(data => {
    res.send(data);
  }).catch(err => {
    res.status(500).send({
      message:
        err.message || "An error occurred while retrieving accounts."
    });
  });
});


//Policy list by user
app.get('/api/policy/:id', function (req, res) {
  autoPolicies.findAll({
    where: { UserId: { [Op.eq]: req.params.id } },
    include: [{ model: vehicle }, { model: coverage }]
  }).then(data => {
    res.send(data);
  }).catch(err => {
    res.status(500).send({
      message:
        err.message || "An error occurred while retrieving accounts."
    });
  });
});

/**
 * This is the login authentication service
 */
 app.post('/auth/login', function (req, res) {
  usersOfApp.findOne({
    where: {
      userName: { [Op.eq]: req.body.login },
      password: { [Op.eq]: req.body.password },
    }
  }).then(data => {
    res.json(data);
  })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "An error occurred while creating the Insured Account."
      });
    });
});


//Insured Account related endpoints
// Get all Insured Accounts
app.get('/api/insuredinfo/:id', function (req, res) {
  console.log("id to retrive " + id);
  const pid = req.params.id;
  insuredAcct.findByPk(pid)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "An error occurred while retrieving accounts."
      });
    });
});



//insured 
app.get('/api/insured/:id', function (req, res) {
  insuredAcct.findByPk(req.params.id).then(data => {
    res.send(data);
  }).catch(err => {
    res.status(500).send({
      message:
        err.message || "An error occurred while retrieving accounts."
    });
  });
});

//Insured Account related endpoints
// Get all Insured Accounts
app.get('/api/insuredinfo', function (req, res) {
  insuredAcct.findAll({})
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "An error occurred while retrieving accounts."
      });
    });
});

app.put('/api/insuredinfo/:id', function (req, res) {
  if (!req.body.firstName) {
    res.status(400).send({
      message: "Some required fields are missing in the data, please verify"
    });
    return;
  }

  // Create an account
  const insAcc = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    gender: req.body.gender,
    dob: req.body.dob
  };
  var where = {
    where: { id: req.params.id }
  };
  // Save account in the database
  insuredAcct.update(insAcc, where)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "An error occurred while creating the Insured Account."
      });
    });
});



//////////////////////////////////////////////////////////////////////
//User related endpoints that are not part of MVP
// Get all users
app.get('/api/user', function (req, res) {
  const firstName = req.query.firstName;
  var condition = firstName ? { firstName: { [Op.iLike]: `%${firstName}%` } } : null;

  usersOfApp.findAll({ where: condition })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving users."
      });
    });
});
// Get user with id
app.get('/api/user/:id', function (req, res) {
  const pid = req.params.id;
  console.log("pid " + pid);
  usersOfApp.findByPk(pid)
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: 'Cannot find User with id=$pid'
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving User with id=" + pid
      });
    });
});

// Get user with id
app.get('/api/uwusers', function (req, res) {
  usersOfApp.findAll({
    where: {
      roleName: { [Op.eq]: 'Underwriter' },
    }
  }).then(data => {
    res.json(data);
  })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving users."
      });
    });
});

app.get('/api/uwausers', function (req, res) {
  usersOfApp.findAll({
    where: {
      roleName: { [Op.eq]: 'UWAssitant' },
    }
  }).then(data => {
    res.json(data);
  })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving users."
      });
    });
});


app.post('/api/user', function (req, res) {
  if (!req.body.firstName) {
    res.status(400).send({
      message: "Some required fields are missing in the data, please verify"
    });
    return;
  }

  // Create a user
  const usr = {
    userName: req.body.userName,
    firstName: req.body.firstName,
    lastName: req.body.lastName
  };
  // Save user in the database
  usersOfApp.create(usr)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the user."
      });
    });
});


/**
usersOfApp.findOne({
  where: {
    userName: { [Op.eq]: req.body.login },
    password: { [Op.eq]: req.body.password },
  }
}).then(data => {
  res.send(data);
}).catch(err => {
  res.status(500).send({
    message:
      err.message || "Some error occurred while verifying login."
  });
});

**/

/** 
// Get all users
app.get('/api/uws', function (request, response) {
var role = "Underwriter"
client.query('SELECT u."firstName", u."lastName", u."userName" from public."Users" u,' 
            + 'public."UserRoles" ur, public."Roles" r where u."id" = ur."UserID" and r."id" = ur."RoleID" and r."RoleName" = $1', [role] ,
function (err, result) {
  if (err) {
      console.log(err);
      response.status(400).send(err);
  }
  response.send(result.rows);
});
});

// Get all users
app.get('/api/uwasst', function (request, response) {
var role = "UWAssistant"
client.query('SELECT u."firstName", u."lastName", u."userName" from public."Users" u,' 
            + 'public."UserRoles" ur, public."Roles" r where u."id" = ur."UserID" and r."id" = ur."RoleID" and r."RoleName" = $1', [role] ,
function (err, result) {
  if (err) {
      console.log(err);
      response.status(400).send(err);
  }
  response.send(result.rows);
});
});







//not working
app.post('/api/userRole', function (request, response) {
var uname = request.body.uname;

console.log(uname);
client.query('SELECT r."RoleName" FROM "UserRoles" ur , "Roles" r, "Users" u WHERE ur."RoleID" = r.ID and u."id" = ur."UserID" and u."userName"  = $1', [uname], 
function (err, result) {
  if (err) {
      console.log(err);
      response.status(400).send(err);
  }
  response.status(200).send(result.rows);
});
});




// Get all users
app.get('/auth/user', function (request, response) {
usersOfApp.findOne({where: {
  userName: request.body.userName}
})
.then(data => {
    response.send(data);
})
.catch(err => {
    response.status(500).send({
    message:
      err.message || "Some error occurred while retrieving users."
  });
});
});

// Get all users
app.get('/auth/user', function (request, response) {

userRoles.findOne({
  include: [
    roles.findOne({where: {
      RoleName: request.body.userName}
    }),
  ],
});


usersOfApp.findOne({where: {
  userName: request.body.userName}
})
.then(data => {
    response.send(data);
})
.catch(err => {
    response.status(500).send({
    message:
      err.message || "Some error occurred while retrieving users."
  });
});
});

// Get all users
app.get('/api/roles', function (request, response) {
roles.findOne({where: {
  RoleName: "Underwriter"}
})
.then(data => {
    response.send(data);
})
.catch(err => {
    response.status(500).send({
    message:
      err.message || "Some error occurred while retrieving users."
  });
});
});

app.post('/api/UWassociation', function (request, response) {
roles.findOne({where: {
  RoleName: "Underwriter"}
})
.then(data => {
    response.send(data);
})
.catch(err => {
    response.status(500).send({
    message:
      err.message || "Some error occurred while retrieving users."
  });
});
});











app.post('/auth/login', function (request, response) {
usersOfApp.findAll()
.then(data => {
    response.send(data);
})
.catch(err => {
    response.status(500).send({
    message:
      err.message || "Some error occurred while retrieving users."
  });
});
});


app.post('/register', async (req, res) => {

// hash the password provided by the user with bcrypt so that
// we are never storing plain text passwords. This is crucial
// for keeping your db clean of sensitive data
const hash = bcrypt.hashSync(req.body.password, 10);

try {
  // create a new user with the password hash from bcrypt
  let user = await User.create(
    Object.assign(req.body, { password: hash })
  );

  // data will be an object with the user and it's authToken
 // let data = await user.authorize();
 const authToken = await async function(UserId) {
  if (!UserId) {
    throw new Error('AuthToken requires a user ID')
  }

  let token = '';

  const possibleCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
    'abcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < 15; i++) {
    token += possibleCharacters.charAt(
      Math.floor(Math.random() * possibleCharacters.length)
    );
  }

  return AuthToken.create({ token, UserId })
}

  // send back the new user and auth token to the
  // client { user, authToken }
  return res.json({ user, authToken });

} catch(err) {
  return res.status(400).send(err);
}

});


app.post('/login', async (req, res) => {
const { username, password } = req.body;

// if the username / password is missing, we use status code 400
// indicating a bad request was made and send back a message
if (!username || !password) {
  return res.status(400).send(
    'Request missing username or password param'
  );
}

try {
  let user = await User.authenticate(username, password)

  user = await user.authorize();

  return res.json(user);

} catch (err) {
  return res.status(400).send('invalid username or password');
}

});


app.delete('/logout', async (req, res) => {

// because the logout request needs to be send with
// authorization we should have access to the user
// on the req object, so we will try to find it and
// call the model method logout
const { user, cookies: { auth_token: authToken } } = req

// we only want to attempt a logout if the user is
// present in the req object, meaning it already
// passed the authentication middleware. There is no reason
// the authToken should be missing at this point, check anyway
if (user && authToken) {
  await req.user.logout(authToken);
  return res.status(204).send()
}

// if the user missing, the user is not logged in, hence we
// use status code 400 indicating a bad request was made
// and send back a message
return res.status(400).send(
  { errors: [{ message: 'not authenticated' }] }
);
});

//Insured Account related endpoints
// Get all Insured Accounts
app.get('/api/insuredwithname/:name', function (req, res) {


  insuredAcct.findAll({
    where: {
      firstName: { [Op.eq]: req.params.name },
    }
  })
    .then(data => {
      res.json(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "An error occurred while retrieving accounts."
      });
    });
});

/**
// Get all users
app.get('/api/users', function (request, response) {
  usersOfApp.findAll()
  .then(data => {
      response.send(data);
  })
  .catch(err => {
      response.status(500).send({
      message:
        err.message || "Some error occurred while retrieving users."
    });
  });
});
*/

// Start app and listen on port 8080  
app.listen(process.env.PORT || 8080);
console.log("Policy server listening on port  - ", (process.env.PORT || 8080));