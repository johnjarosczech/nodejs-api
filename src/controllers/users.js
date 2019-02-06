const userModel = require('../models/users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validateRegisterInput = require('../validation/register');
const validateLoginInput = require('../validation/login');

module.exports = {
    create: function(req, res, next) {
        const { errors, isValid } = validateRegisterInput(req.body);

        if (!isValid) {
            return res.status(400).json(errors);
        }

        userModel.findOne({
            email: req.body.email
        }).then(user => {
            if (user) {
                return res.status(400).json({
                    email: 'Email already exists'
                });
            } else {
                userModel.create({ name: req.body.name, email: req.body.email, password: req.body.password }, function(err, result) {
                    if (err) {
                        next(err);
                    } 
                    else {
                        res.json({
                            status: 'success',
                            message: 'User added successfully!',
                            data: null
                        });
                    }
                });
            }
        })
    },
    authenticate: function(req, res, next) {
        const { errors, isValid } = validateLoginInput(req.body);

        if (!isValid) {
            return res.status(400).json(errors);
        }

        userModel.findOne({ email: req.body.email })
            .then(user => {
                if (!user) {
                    errors.email = 'User not found'
                    return res.status(404).json(errors);
                }

                bcrypt.compare(req.body.password, user.password)
                    .then(isMatch => {
                        if (isMatch) {
                            const payload = {
                                id: user.id,
                                name: user.name
                            }
                            jwt.sign(payload, 'secret', {
                                expiresIn: 3600
                            }, (err, token) => {
                                if (err) {
                                    console.error('There is some error in token', err);
                                }
                                else {
                                    res.json({
                                        success: true,
                                        token: `Bearer ${token}`
                                    })
                                }
                            })
                        }
                        else {
                            errors.password = 'Incorrect Password';
                            return res.status(400).json(errors);
                        }
                    })

                
            })
    }
}