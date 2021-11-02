const express = require('express')
const bcrypt = require('bcrypt')
const bodyParser = require('body-parser')
const app = express()
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


/**********************************Insured related endpoints ***************************************/
/**
 *  creates insured Account record
 *  during the process it inserts record in address table
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
 * This returns the insured record for a given insured primary key. 
 * This is used on the Home page
 */
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

/**
 * This returns all of the insureds records, returns along with the address information
 * This is used on the Home page
 */
app.get('/api/insuredinfo', function (req, res) {
  insuredAcct.findAll({ include: [{ model: insuredAddress }] })
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

/**********************************Policy related endpoints ***************************************/
/**
 * creates policy along with vehicles and coverages
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

  // Save policy in the database along with Vehicle and Coverage table record insertions
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

/**
 *  Sets the underwriting status of a policy
 */
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

/**
 *  Returns policies that require UW approval and are not yet approved or rejected
 */
app.get('/api/uwapproval', function (req, res) {
  autoPolicies.findAll({
    where: {
      requireUWApprovalInd: { [Op.eq]: true },
      isUWApprovedInd: { [Op.is]: null }
    },
    include: [{ model: vehicle }]
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
 *  Returns the list of policies created by the user passed in the request
 *  this includes vehile and coverage records
 */
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

/**********************************login endpoint ***************************************/
/**
 * This does the login authentication. 
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
          err.message || "User is not authenticated."
      });
    });
});

/**********************************User related endpoints ***************************************///User related endpoints that are not part of MVP
/**
 * Returns all of the users
*/ 
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

/**
 * Returns the user that matches with the primary key
*/ 
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

app.post('/api/user', function (req, res) {
  console.log("in ",req.body.firstName);
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
    lastName: req.body.lastName,
    password: req.body.password,
    roleName: req.body.roleName,
  };
  console.log("creating user");
  // Save user in the database
  usersOfApp.create(usr)
    .then(data => {
      res.json(data);
    }).catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the user."
      });
    });
});

// Start app and listen on port 8080  
app.listen(process.env.PORT || 8080);
console.log("Policy server listening on port  - ", (process.env.PORT || 8080));