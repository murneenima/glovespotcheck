const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const hbs = require('hbs')
const moment = require('moment');
const request = require('request')
const schedule = require('node-schedule');
const xl = require('excel4node');
const nodemailer = require('nodemailer');
const fs = require('fs')
const path = require('path');
//const nodeoutlook = require('nodejs-nodemailer-outlook')


// ============== require Model ===============
var Admin = require('./AdminModel')
var Staff = require('./StaffModel')
var Block = require('./BlockModel')
var Product = require('./ProductModel')
var Schedule = require('./ScheduleModel') // weekly
var Current = require('./CurrentModel')
var Month = require('./MonthModel')
var Spotcheck = require('./SpotcheckModel')
var StdSize = require('./StdSizeModel')
var StdProductName = require('./StdProductNameModel')
var StdProductType = require('./StdProductTypeModel')
var StdLength = require('./StdLengthModel')
var StdWeight = require('./StdWeightModel')
var StdBlock = require('./StdBlockModel')
var StdProductline = require('./StdProductlineModel')
var Alert = require('./AlertModel')

// =============== Connect =========================


// mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gloveDB').then((doc) => {
//     console.log('@@@@ Success to connect with Database @@@')
// }, (err) => {
//     console.log('!!!!!!!!!! error to connect with database !!!!!!!!!')
// })
mongoose.connect('mongodb://localhost:27017/DBglove').then((doc) => {
    console.log('@@@@ Success to connect with Database @@@')
}, (err) => {
    console.log('!!!!!!!!!! error to connect with database !!!!!!!!!')
})

var app = express()
app.use(express.static('public'))
app.set('view engine', 'hbs')
app.use(bodyParser.json()) // ส่งข้อมูลแบบ JSon
app.use(bodyParser.urlencoded({
    extended: true
}));


app.use((req, res, next) => { // allow the other to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader("Access-Control-Expose-Headers", "X-HMAC-CSRF, X-Secret, WWW-Authenticate");
    res.setHeader('Access-Control-Allow-Headers', 'Origin, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Response-Time, X-PINGOTHER, X-CSRF-Token,Authorization, X-Access-Token')
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
})

//app.set('view engine', 'hbs');
//app.use(express.static('public'))

//============= API test============//
app.get('/', (req, res) => {
    res.render('admin_login.hbs')
    console.log('Hello')
   //res.send('Hello')
})

// add value 
app.get('/value', (req, res) => {
    res.render('admin_addValue.hbs')
})

// report
app.get('/report', (req, res) => {
    res.render('admin_exportReport.hbs')
})
// add staff 
app.get('/staff', (req, res) => {
    res.render('admin_addStaff.hbs')
})

// Sign Up 
app.post('/signup', (req, res) => {
    let newAdmin = new Admin({
        username: req.body.username,
        password: req.body.password
    })

    newAdmin.save().then((doc) => {
        res.send(doc)
    }, (err) => {
        res.status(400).send(err)
    })
})

// Admin Login 
app.post('/signin', (req, res) => {
    let username = req.body.username1
    let password = req.body.password1

    Admin.find({
        username: username,
        password: password
    }).then((admin) => {
        if (admin.length == 1) {
            //res.send(admin)
            Current.find({}, (err, staffschedule) => {
                if (err) console.log(err)
            }).then((staffschedule) => {
                res.render('admin_dailySchedule.hbs', {
                    staffschedule: encodeURI(JSON.stringify(staffschedule))
                })
            }, (err) => {
                res.status(400).send('error')
            })
        } else {
            res.status(400).send('Cannot Login')
        }
    }, (err) => {
        res.status(400).send(err)

    })
})

// ####################################### Staff #############################################
// insert staff 
app.post('/addstaff', (req, res) => {
    if (req.body.emp_position == 'Choose') {
        res.status(400).send('Position doesnot choose');
        return
    }

    if (req.body.emp_dept == 'Choose') {
        res.status(400).send('Department doesnot choose');
        return
    }

    // Position
    let emp_position = ' '
    if (req.body.emp_position == 'Excutive') {
        emp_position = 'Excutive';
    } else if (req.body.emp_position == 'Excutive II') {
        emp_position = 'Excutive II';
    } else if (req.body.emp_position == 'Officer') {
        emp_position = 'Officer';
    } else if (req.body.emp_position == 'Supervisor') {
        emp_position = 'Supervisor';
    } else if (req.body.emp_position == 'Admin/Secretary') {
        emp_position = 'Admin/Secretary'
    }
    //console.log('Position == ',req.body.emp_position)


    //-------- Department -------------

    let emp_dept = ' '
    if (req.body.emp_dept == 'Admin') {
        emp_dept = 'Admin';
    } else if (req.body.emp_dept == 'HR') {
        emp_dept = 'HR';
    } else if (req.body.emp_dept == 'Finance') {
        emp_dept = 'Finance';
    } else if (req.body.emp_dept == 'IT') {
        emp_dept = 'IT';
    }
    //console.log('Dept == ',req.body.emp_dept)

    let newStaff = Staff({
        badgeNo: req.body.badgeNo,
        emp_password: req.body.emp_password,
        emp_name: req.body.emp_name,
        emp_surname: req.body.emp_surname,
        emp_position: emp_position,
        emp_dept: emp_dept
    })
    newStaff.save().then((doc) => {
        console.log('success')
        res.render('admin_addStaff.hbs')
    }, (err) => {
        res.status(400).send(err)
    })

})

// update staff
app.post('/update', (req, res) => {

    let emp_dept = ' '
    if (req.body.emp_dept == 'Admin') {
        emp_dept = 'Admin';
    } else if (req.body.emp_dept == 'HR') {
        emp_dept = 'HR';
    } else if (req.body.emp_dept == 'Finance') {
        emp_dept = 'Finance';
    } else if (req.body.emp_dept == 'IT') {
        emp_dept = 'IT';
    }

    let emp_position = ' '
    if (req.body.emp_position == 'Excutive') {
        emp_position = 'Excutive';
    } else if (req.body.emp_position == 'Excutive II') {
        emp_position = 'Excutive II';
    } else if (req.body.emp_position == 'Officer') {
        emp_position = 'Officer';
    } else if (req.body.emp_position == 'Supervisor') {
        emp_position = 'Supervisor';
    } else if (req.body.emp_position == 'Admin/Secretary') {
        emp_position = 'Admin/Secretary'
    }
    // console.log(req.body.badgeNo)
    // console.log(req.body.emp_name)
    // console.log(req.body.emp_surname)
    // console.log(emp_dept)
    // console.log(emp_position)


    Staff.findOne({ badgeNo: req.body.badgeNo }).then((d) => {
        d.emp_name = req.body.emp_name
        d.emp_surname = req.body.emp_surname
        d.emp_dept = emp_dept
        d.emp_position = emp_position

        d.save().then((success) => {
            // success.render('admin_manageStaffData.hbs')
            console.log('UPDATE Staff data on STAFF table success')

            Schedule.findOne({ s_badgeNo: req.body.badgeNo }).then((schedule) => {
                schedule.s_name = req.body.emp_name
                schedule.s_surname = req.body.emp_surname
                schedule.s_department = emp_dept
                schedule.s_position = emp_position

                schedule.save().then((success) => {
                    // success.render('admin_manageStaffData.hbs')
                    console.log('UPDATE Staff data on SCHEDULE table success')

                    Month.findOne({ m_badgeNo: req.body.badgeNo }).then((month) => {
                        month.m_name = req.body.emp_name
                        month.m_surname = req.body.emp_surname
                        month.m_department = emp_dept
                        month.m_position = emp_position

                        month.save().then((success) => {
                            console.log('UPDATE Staff data on MONTH table success')

                            Current.findOne({ c_badgeNo: req.body.badgeNo }).then((current) => {
                                current.c_name = req.body.emp_name
                                current.c_surname = req.body.emp_surname
                                current.c_position = emp_position
                                current.c_department = emp_dept

                                current.save().then((success) => {
                                    console.log('UPDATE Staff data on CURRENT table success')

                                    Staff.find({}, (err, dataStaff) => {
                                        if (err) console.log(err);
                                    }).then((dataStaff) => {
                                        res.render('admin_manageStaffData.hbs', {
                                            dataStaff: encodeURI(JSON.stringify(dataStaff))
                                        })
                                    }, (err) => {
                                        res.status(400).send('error');
                                    })

                                }, (e) => {
                                    res.status(400).send(e)
                                })
                            }, (e) => {
                                res.status(400).send(e)
                            })

                        }, (e) => {
                            res.status(400).send(e)
                        })
                    })

                }, (e) => {
                    res.status(400).send(e)
                })
            }, (err) => {
                res.status(400).send(err)
            })

        })
    })
})

// remove staff data
app.post('/remove', (req, res) => {
    //let dataIn = JSON.parse(req.body)
    console.log('dataIn :', req.body.id)
    Staff.remove({ badgeNo: req.body.id }).then((d) => {
        console.log('=====success====')

        Schedule.remove({ s_badgeNo: req.body.id }).then((d) => {
            console.log('=====success remove in table shedule ====')

            Month.remove({ m_badgeNo: req.body.id }).then((d) => {
                console.log('=====success remove in table shedule ====')

                Current.remove({ c_badgeNo: req.body.id }).then((d) => {
                    console.log('=====success remove in table shedule ====')

                }, (err) => {
                    res.status(400).send(err)
                })
            }, (err) => {
                res.status(400).send(err)
            })
        }, (err) => {
            res.status(400).send(err)
        })

    }, (err) => {
        res.status(400).send(err)
    })

})


// ################################## Staff page // แสดงผลพนักงานทั้งหมด ####################
// Send Data for display all 
app.get('/send_data', (req, res) => {
    Staff.find({}, (err, dataStaff) => {
        if (err) console.log(err);
    }).then((dataStaff) => {
        res.render('admin_manageStaffData.hbs', {
            dataStaff: encodeURI(JSON.stringify(dataStaff))
        })
    }, (err) => {
        res.status(400).send('error');
    })
})

// ################################ daily schedule ######################################
// display daily schedule 
app.get('/dailyschedule', (req, res) => {
    Current.find({}, (err, staffschedule) => {
        if (err) console.log(err)
    }).then((staffschedule) => {
        res.render('admin_dailySchedule.hbs', {
            staffschedule: encodeURI(JSON.stringify(staffschedule))
        })
    }, (err) => {
        res.status(400).send('error')
    })
})


// ##################### Weekly Schedule ##############################################
// display weekly schedule
app.get('/weeklyschedule', (req, res) => {
    Schedule.find({}, (err, staffschedule) => {
        if (err) console.log(err)
    }).then((staffschedule) => {
        res.render('admin_weeklySchedule.hbs', {
            staffschedule: encodeURI(JSON.stringify(staffschedule))

        })
    }, (err) => {
        res.status(400).send('error')
    })
})

//####################################### add value ##############################################
// add size
app.post('/addsize', (req, res) => {
    let newSize = new StdSize({
        std_size: req.body.size
    })

    newSize.save().then((doc) => {
        console.log('success')
        res.render('admin_addValue.hbs')
    }, (err) => {
        res.status(400).send(err)
    })
})
// add addpdname
app.post('/addpdname', (req, res) => {
    let newStdProductName = new StdProductName({
        std_productname: req.body.std_productname
    })

    newStdProductName.save().then((doc) => {
        console.log('success')
        // res.send(doc)
        res.render('admin_addValue.hbs')
    }, (err) => {
        res.status(400).send(err)
    })
})
// add addpdtype
app.post('/addpdtype', (req, res) => {
    let newStdProductType = new StdProductType({
        std_producttype: req.body.std_producttype
    })

    newStdProductType.save().then((doc) => {
        console.log('success')
        // res.send(doc)
        res.render('admin_addValue.hbs')
    }, (err) => {
        res.status(400).send(err)
    })
})
// add add length
app.post('/addlength', (req, res) => {
    let newStdLength = new StdLength({
        std_length: req.body.std_length
    })

    newStdLength.save().then((doc) => {
        console.log('success')
        // res.send(doc)
        res.render('admin_addValue.hbs')
    }, (err) => {
        res.status(400).send(err)
    })
})
// add add weight
app.post('/addweight', (req, res) => {
    let newStdWeight = new StdWeight({
        std_weight: req.body.std_weight
    })

    newStdWeight.save().then((doc) => {
        console.log('succes')
        res.render('admin_addValue.hbs')

    }, (err) => {
        res.status(400).send(err)
    })
})

// add std block
app.post('/addblock', (req, res) => {
    let newStdBlock = new StdBlock({
        std_block: req.body.block
    })

    newStdBlock.save().then((doc) => {
        console.log('succes')
        res.render('admin_addValue.hbs')
    }, (err) => {
        res.status(400).send(err)
    })
})

// add productline
app.post('/addproductline', (req, res) => {
    let newStdProductline = new StdProductline({
        std_productline: req.body.productline
    })

    newStdProductline.save().then((doc) => {
        console.log('succes')
        res.render('admin_addValue.hbs')
    }, (err) => {
        res.status(400).send(err)
    })
})

// export all value for adding product
app.get('/sendvalue', (req, res) => {
    let data = {}

    StdSize.find({}, (err, Size) => {
        if (err) console.log('error')
    }).then((Size) => {
        data.Size = Size

        StdProductName.find({}, (err, ProductName) => {
            if (err) console.log('error')
        }).then((ProductName) => {
            data.ProductName = ProductName

            StdProductType.find({}, (err, ProductType) => {
                if (err) console.log('error')
            }).then((ProductType) => {
                data.ProductType = ProductType

                StdLength.find({}, (err, Length) => {
                    if (err) console.log('error')
                }).then((Length) => {
                    data.Length = Length

                    StdWeight.find({}, (err, Weight) => {
                        if (err) console.log('error')
                    }).then((Weight) => {
                        data.Weight = Weight
                        res.render('admin_addProduct.hbs', { data: encodeURI(JSON.stringify(data)) })
                    }, (err) => {
                        res.status(400).send(err)
                    })
                })
            })
        })
    })
})


// #################################################### add Block page #######################################
//adddblock_productline
app.post('/adddblock_productline', (req, res) => {
    let newBlock = new Block({
        blockName: req.body.block,
        productLine: req.body.productline
    })
    newBlock.save().then((doc) => {
        console.log('succes to saving in BLOCK ')
    }, (err) => {
        res.status(400).send(err)
    })
})

// add product line to block
app.get('/sendblock', (req, res) => {
    let data = {}
    StdBlock.find({}, (err, Block) => {
        if (err) console.log('error')
        data.Block = Block
    }).then((Block) => {
        StdProductline.find({}, (err, ProductLine) => {
            if (err) console.log('error')
        }).then((Productline) => {
            data.Productline = Productline
            res.render('admin_addBlock.hbs', { data: encodeURI(JSON.stringify(data)) })
        }, (err) => {
            res.status(400).send(err)
        })
    })
})

// ################################# add product ###############################################
// add product
app.post('/addproduct', (req, res) => {
    let data = {}
    let newProduct = new Product({
        product_id: req.body.product_id,
        product_name: req.body.product_name,
        product_type: req.body.product_type,
        product_size: req.body.product_size,
        weight_min: req.body.weight_min,
        weight_max: req.body.weight_max,
        length_min: req.body.length_min,
        length_max: req.body.length_max
    })

    newProduct.save().then((doc) => {
        console.log(doc)

        StdSize.find({}, (err, Size) => {
            if (err) console.log('error')
        }).then((Size) => {
            data.Size = Size

            StdProductName.find({}, (err, ProductName) => {
                if (err) console.log('error')
            }).then((ProductName) => {
                data.ProductName = ProductName

                StdProductType.find({}, (err, ProductType) => {
                    if (err) console.log('error')
                }).then((ProductType) => {
                    data.ProductType = ProductType

                    StdLength.find({}, (err, Length) => {
                        if (err) console.log('error')
                    }).then((Length) => {
                        data.Length = Length

                        StdWeight.find({}, (err, Weight) => {
                            if (err) console.log('error')
                        }).then((Weight) => {
                            data.Weight = Weight
                            res.render('admin_addProduct.hbs', { data: encodeURI(JSON.stringify(data)) })
                        }, (err) => {
                            res.status(400).send(err)
                        })
                    })
                })
            })
        })
        //res.send(doc)
    }, (err) => {
        res.status(400).send(err)
    })
})

// ####################################### All Product ###############################################
//sent all product to display 
app.get('/send_product', (req, res) => {

    let data = {}
    // block 
    StdBlock.find({}, (err, datablock) => {
        if (err) console.log(err)
    }).then((datablock) => {
        data.StdBlock = datablock

        // product bame , prduct type
        Product.find({}, (err, dataproduct) => {
            if (err) console.log(err)
        }).then((dataproduct) => {
            data.Product = dataproduct

            //  Size
            StdSize.find({}, (err, datasize) => {
                if (err) console.log(err)
            }).then((datasize) => {
                data.StdSize = datasize

                // Std Length
                StdLength.find({}, (err, datalength) => {
                    if (err) console.log(err)
                }).then((datalength) => {
                    data.StdLength = datalength


                    //Std weight
                    StdWeight.find({}, (err, dataweight) => {
                        if (err) console.log(err)
                    }).then((dataweight) => {
                        data.StdWeight = dataweight

                        StdProductline.find({}, (err, dataproductline) => {
                            if (err) console.log(err)
                        }).then((dataproductline) => {
                            data.StdProductline = dataproductline

                            StdProductName.find({}, (err, dataProductname) => {
                                if (err) console.log(err)
                            }).then((dataProductname) => {
                                data.StdProductName = dataProductname

                                StdProductType.find({}, (err, producttype) => {
                                    if (err) console.log(err)
                                }).then((producttype) => {
                                    data.StdProductType = producttype

                                    Block.find({}, (err, datablock) => {
                                        if (err) console.log(err)
                                    }).then((datablock) => {
                                        data.Block = datablock
                                        res.render('admin_allProduct.hbs', { data: encodeURI(JSON.stringify(data)) })
                                    }, (err) => {
                                        res.status(400).send(err)
                                    })
                                })
                            })
                        })
                    })

                })

            })

        })

    }, (err) => {
        res.status(400).send('error')
    })
})

app.get('/send_value', (req, res) => {

    let data = {}
    // block 
    StdBlock.find({}, (err, datablock) => {
        if (err) console.log(err)
    }).then((datablock) => {
        data.StdBlock = datablock

        // product bame , prduct type
        Product.find({}, (err, dataproduct) => {
            if (err) console.log(err)
        }).then((dataproduct) => {
            data.Product = dataproduct

            //  Size
            StdSize.find({}, (err, datasize) => {
                if (err) console.log(err)
            }).then((datasize) => {
                data.StdSize = datasize

                // Std Length
                StdLength.find({}, (err, datalength) => {
                    if (err) console.log(err)
                }).then((datalength) => {
                    data.StdLength = datalength

                    //Std weight
                    StdWeight.find({}, (err, dataweight) => {
                        if (err) console.log(err)
                    }).then((dataweight) => {
                        data.StdWeight = dataweight

                        StdProductline.find({}, (err, dataproductline) => {
                            if (err) console.log(err)
                        }).then((dataproductline) => {
                            data.StdProductline = dataproductline

                            StdProductName.find({}, (err, dataProductname) => {
                                if (err) console.log(err)
                            }).then((dataProductname) => {
                                data.StdProductName = dataProductname

                                StdProductType.find({}, (err, producttype) => {
                                    if (err) console.log(err)
                                }).then((producttype) => {
                                    data.StdProductType = producttype

                                    Block.find({}, (err, datablock) => {
                                        if (err) console.log(err)
                                    }).then((datablock) => {
                                        data.Block = datablock
                                        res.render('admin_value.hbs', { data: encodeURI(JSON.stringify(data)) })
                                    }, (err) => {
                                        res.status(400).send(err)
                                    })
                                })
                            })
                        })
                    })
                })
            })
        })
    }, (err) => {
        res.status(400).send('error')
    })
})
// edit product data
app.post('/editproduct', (req, res) => {
    Product.findOne({ product_id: req.body.product_id }).then((d) => {
        d.weight_min = req.body.weight_min
        d.weight_max = req.body.weight_max
        d.length_min = req.body.length_min
        d.length_max = req.body.length_max

        d.save().then((success) => {
            console.log('Success')
        }, (e) => {
            res.status(400).send(e)
        }, (err) => {
            res.status(400).send(err)
        })
    })
})
// remove product data
app.post('/removeproduct', (req, res) => {
    console.log('dataIn :', req.body.id)
    Product.remove({ product_id: req.body.id }).then((d) => {
        console.log('Product deleted success')
    }, (err) => {
        res.status(400).send(err)
    })
})
// edit block
app.post('/removeblock', (req, res) => {
    console.log('dataIn :', req.body.id)
    Block.remove({ productLine: req.body.id }).then((data) => {
        console.log('Block deleted success')
    }, (err) => {
        res.status(400).send(err)
    })
})
// edit STD size
app.post('/remove_stdsize', (req, res) => {
    console.log('dataIn :', req.body.id)
    StdSize.remove({ std_size: req.body.id }).then((data) => {
        console.log('Size deleted success')
    }, (err) => {
        res.status(400).send(err)
    })
})
// delete Product line
app.post('/remove_productline', (req, res) => {
    console.log('dataIn :', req.body.id)
    StdProductline.remove({ std_productline: req.body.id }).then((data) => {
        console.log('Product line deleted success')
    }, (err) => {
        res.status(400).send(err)
    })
})
// delete PD name
app.post('/remove_productname', (req, res) => {
    console.log('dataIn :', req.body.id)
    StdProductName.remove({ std_productname: req.body.id }).then((data) => {
        console.log('Product name deleted success')
    }, (err) => {
        res.status(400).send(err)
    })
})
// delete PD type
app.post('/remove_producttype', (req, res) => {
    console.log('dataIn :', req.body.id)
    StdProductType.remove({ std_producttype: req.body.id }).then((data) => {
        console.log('Product Type deleted success')
    }, (err) => {
        res.status(400).send(err)
    })
})
// delete length
app.post('/remove_length', (req, res) => {
    console.log('dataIn :', req.body.id)
    StdLength.remove({ std_length: req.body.id }).then((data) => {
        console.log('Length deleted success')
    }, (err) => {
        res.status(400).send(err)
    })
})
// delete weight
app.post('/remove_weight', (req, res) => {
    console.log('dataIn :', req.body.id)
    StdWeight.remove({ std_weight: req.body.id }).then((data) => {
        console.log('Weight deleted success')
    }, (err) => {
        res.status(400).send(err)
    })
})


// ################################## manage staff Schedule #######################
// get staff data to add schedule
app.get('/send_staff', (req, res) => {
    Staff.find({}, (err, dataStaff) => {
        if (err) console.log(err);
    }).then((dataStaff) => {
        res.render('admin_addStaffSchedule.hbs', {
            dataStaff: encodeURI(JSON.stringify(dataStaff))
        })
    }, (err) => {
        res.status(400).send('error');
    })
})

// save weekly schedule 
app.post('/saveschedule', (req, res) => {

    let newSchedule = new Schedule({
        day: req.body.day,
        s_badgeNo: req.body.edit_id,
        s_name: req.body.edit_name,
        s_surname: req.body.edit_surname,
        s_position: req.body.edit_position,
        s_department: req.body.edit_dept,
        s_status: req.body.s_status,
        s_day: req.body.s_day,
        s_month: req.body.s_month,
        s_year: req.body.s_year
    })
    newSchedule.save().then((doc) => {
        console.log('saving data to table SCHEDULE')
        let newMonth = new Month({
            m_day: req.body.day,
            m_badgeNo: req.body.edit_id,
            m_name: req.body.edit_name,
            m_surname: req.body.edit_surname,
            m_position: req.body.edit_position,
            m_department: req.body.edit_dept,
            m_status: req.body.s_status,
            m_date: req.body.m_day,
            m_month: req.body.m_month,
            m_year: req.body.m_year
        })
        newMonth.save().then((doc) => {
            console.log('success to save data in table MONTH                                                                                                           ')
            //res.send(doc)
            Staff.find({}, (err, dataStaff) => {
                if (err) console.log(err);
            }).then((dataStaff) => {
                res.render('admin_addStaffSchedule.hbs', {
                    dataStaff: encodeURI(JSON.stringify(dataStaff))
                })
            })
        }, (err) => {
            res.status(400).send(err)
        })
    }, (err) => {
        res.status(400).send(err)
    })
})

//  Daily Schedule get staff to dailay , current table
// !!!!!!!!! run every midnight !!!!!!!!!!!!!! 
var j = schedule.scheduleJob('48 * * * *', function () {
    var day_format = moment().format('dddd');
    console.log(day_format)

    var day = moment().format('DD');
    var month = moment().format('MMMM')
    var year = moment().format('YYYY')
    // console.log(day)
    // console.log(month)
    // console.log(year)

    Current.remove({}, function (err) {
        console.log('collection removed')
    });

    Schedule.find({ day: day_format }, (err, obj) => {
        for (let i = 0; i < obj.length; i++) {
            var name = obj[i].s_name;
            console.log(name)
            let newCurrent = Current({
                current_day: obj[i].day,
                c_badgeNo: obj[i].s_badgeNo,
                c_name: obj[i].s_name,
                c_surname: obj[i].s_surname,
                c_position: obj[i].s_position,
                c_department: obj[i].s_department,
                c_status: obj[i].s_status,
                c_date: day,
                c_month: month,
                c_year: year
            })

            newCurrent.save().then((doc) => {
                Schedule.findOne({ s_badgeNo: obj[i].s_badgeNo }, function (err, data) {
                    if (data) {
                        data.s_day = day
                        data.s_month = month
                        data.s_year = year
                        data.save(function (err) {
                            if (err) // do something
                                console.log('is fail to update date on SCHEDULE table // (weekly)')
                            else
                                console.log('is UPdated date on SCHEDULE table // (weekly)')
                        });
                    } else {
                        console.log(err);
                    }
                })

                Month.findOne({ m_badgeNo: obj[i].s_badgeNo }, function (err, datamonth) {
                    if (datamonth) {
                        datamonth.m_date = day
                        datamonth.m_month = month
                        datamonth.m_year = year
                        datamonth.save(function (err) {
                            if (err) // do something
                                console.log('is fail to update date on MONTH table')
                            else
                                console.log('is UPdated date MONTH table')
                        });
                    } else {
                        console.log(err);
                    }
                })

            }, (err) => {
                console.log('save data to Current Model error')
                res.status(400).send(err)
            })
        }
    })
});


// ##################### manage staff Schedule ###############
app.get('/manageschedule', (req, res) => {
    Schedule.find({}, (err, schedule) => {
        if (err) console.log(err)
    }).then((schedule) => {
        res.render('admin_manageStaffSchedule.hbs', {
            schedule: encodeURI(JSON.stringify(schedule))
        })
    }, (err) => {
        res.status(400).send('error')
    })
})

app.post('/editstaff_schedule', (req, res) => {
    Schedule.findOne({ s_badgeNo: req.body.s_badgeNo }).then((d) => {
        d.s_status = req.body.s_status2

        d.save().then((success) => {
            console.log('Success to update STATUS')

            Schedule.find({}, (err, schedule) => {
                if (err) console.log(err)
            }).then((schedule) => {
                res.render('admin_manageStaffSchedule.hbs', {
                    schedule: encodeURI(JSON.stringify(schedule))
                })
            }, (err) => {
                res.status(400).send('error')
            })

        }, (e) => {
            res.status(400).send(e)
        }, (err) => {
            res.status(400).send(err)
        })

    })

})

// ########################### Export report ###############
// send spot check data to report page
app.get('/sendspotcheck', (req, res) => {
    Spotcheck.find({}, (err, spotcheck) => {
        if (err) console.log(err);
    }).then((spotcheck) => {
        res.render('admin_exportReport.hbs', {
            spotcheck: encodeURI(JSON.stringify(spotcheck))
        })
    }, (err) => {
        res.status(400).send('error');
    })
})

app.post('/export_schedule', (req, res) => {
    let wb = new xl.Workbook();
    let ws = wb.addWorksheet('Sheet 1');

    let numStyle = wb.createStyle({
        font: {
            color: '#000000',
            size: 12
        },
        numberFormat: '$#,##0.00; ($#,##0.00); -'
    });

    Spotcheck.find({ spot_month: req.body.month1, spot_year: req.body.year1 }, function (err, result) {
        ws.cell(1, 1).string("Time").style(numStyle);
        ws.cell(1, 2).string("Date").style(numStyle);
        ws.cell(1, 3).string("Badge No").style(numStyle);
        ws.cell(1, 4).string("Name").style(numStyle);
        ws.cell(1, 5).string("Surname").style(numStyle);
        ws.cell(1, 6).string("Block").style(numStyle);
        ws.cell(1, 7).string("Product Line").style(numStyle);
        ws.cell(1, 8).string("Productname").style(numStyle);
        ws.cell(1, 9).string("Length").style(numStyle);
        ws.cell(1, 10).string("Weight").style(numStyle);
        ws.cell(1, 11).string("Line Speed").style(numStyle);
        let row = 2;
        for (let j = 0; j < result.length; j++) {
            ws.cell(row, 1).string("" + result[j].spot_time);
            ws.cell(row, 2).string("" + result[j].spot_day + " " + result[j].spot_month + " " + result[j].spot_year);
            ws.cell(row, 3).string("" + result[j].spot_badge);
            ws.cell(row, 4).string("" + result[j].spot_name);
            ws.cell(row, 5).string("" + result[j].spot_surname);
            ws.cell(row, 6).string("" + result[j].spot_block);
            ws.cell(row, 7).string("" + result[j].spot_productline);
            ws.cell(row, 8).string("" + result[j].spot_productname + "-" + result[j].spot_producttype);
            ws.cell(row, 9).string("" + result[j].spot_length);
            ws.cell(row, 10).string("" + result[j].spot_weight);
            ws.cell(row, 11).string("" + result[j].spot_linespeed);
            row++

        }
        //wb.write('myfirstexcel.xlsx')
        wb.write('staff_spotcheck.xlsx', res);
        // res.render('admin_exportReport.hbs')
    }, (err) => {
        res.status(400).send(err)
    })

    //ws.cell(1,1).number(100); 
    // หมายถึงใส่ค่าตัวเลข 100 ลงไปที่ cell A1
    //ws.cell(1,2).string('some text'); 
    //หมายถึงใส่ค่าตัวอักษร some text ลงใน cell B1
    //ws.cell(1,3).formula('A1+A2'); 
    //หมายถึงใส่สูตร A1+A2 ใน cell C1
    //ws.cell(1,4).bool(true);
    //หมายถึงใส่ค่า boolean true ใน cell D1
})

app.post('/export_alert', (req, res) => {
    let wb2 = new xl.Workbook();
    let ws2 = wb2.addWorksheet('Sheet 1');

    let numStyle = wb2.createStyle({
        font: {
            color: '#000000',
            size: 12
        },
        numberFormat: '$#,##0.00; ($#,##0.00); -'
    });

    Alert.find({ a_month: req.body.month2, a_year: req.body.year2 }, function (err, al) {
        ws2.cell(1, 1).string("Time").style(numStyle);
        ws2.cell(1, 2).string("Date").style(numStyle);
        ws2.cell(1, 3).string("Badge No").style(numStyle);
        ws2.cell(1, 4).string("Name Surname").style(numStyle);
        ws2.cell(1, 5).string("Depatment").style(numStyle);
        ws2.cell(1, 6).string("Block").style(numStyle);
        ws2.cell(1, 7).string("Product Line").style(numStyle);
        ws2.cell(1, 8).string("Product ID").style(numStyle);
        ws2.cell(1, 9).string("Productname").style(numStyle);
        ws2.cell(1, 10).string("STD Length").style(numStyle);
        ws2.cell(1, 11).string("Length").style(numStyle);
        ws2.cell(1, 12).string("STD Weight").style(numStyle);
        ws2.cell(1, 13).string("Weight").style(numStyle);
        ws2.cell(1, 14).string("Line Speed").style(numStyle);

        let row2 = 2;
        for (let i = 0; i < al.length; i++) {
            ws2.cell(row2, 1).string("" + al[i].a_time);
            ws2.cell(row2, 2).string("" + al[i].a_day + " " + al[i].a_date + " " + al[i].a_month + " " + al[i].a_year);
            ws2.cell(row2, 3).string("" + al[i].a_badgeNo);
            ws2.cell(row2, 4).string("" + al[i].a_name + " " + al[i].a_surname);
            ws2.cell(row2, 5).string("" + al[i].a_dept);
            ws2.cell(row2, 6).string("" + al[i].a_block);
            ws2.cell(row2, 7).string("" + al[i].a_productline);
            ws2.cell(row2, 8).string("" + al[i].a_productID);
            ws2.cell(row2, 9).string("" + al[i].a_productName + "-" + al[i].a_productType);
            ws2.cell(row2, 10).string("" + al[i].a_stdlength_min + "-" + al[i].a_stdlength_max);
            ws2.cell(row2, 11).string("" + al[i].a_length);
            ws2.cell(row2, 12).string("" + al[i].a_stdweight_min + "-" + al[i].a_stdweight_max);
            ws2.cell(row2, 13).string("" + al[i].a_weight);
            ws2.cell(row2, 14).string("" + al[i].a_linespeed);
            row2++
        }

        wb2.write('over_under_standard.xlsx', res);
        // res.render('admin_exportReport.hbs')

    }, (err) => {
        res.status(400).send(err)
    })

})

// ########################## export to chart #######################
app.get('/chart', (req, res) => {
    Spotcheck.find({}, (err, spotcheck) => {
        if (err) console.log(err);
    }).then((spotcheck) => {
        res.render('admin_gloveReport.hbs', {
            spotcheck: encodeURI(JSON.stringify(spotcheck))
        })
    }, (err) => {
        res.status(400).send('error');
    })
})
// ############################# sending to  email ###################
var j = schedule.scheduleJob('59 * * * *', function () {
    console.log('===============Export Report============================');

    let time = moment().format('LT');
    let date = moment().format('dddd');
    let day = moment().format('DD');
    let month = moment().format('MMMM')
    let year = moment().format('YYYY')

    let wb2 = new xl.Workbook();
    let ws2 = wb2.addWorksheet('Sheet 1');

    let numStyle = wb2.createStyle({
        font: {
            color: '#000000',
            size: 12
        },
        numberFormat: '$#,##0.00; ($#,##0.00); -'
    });
    Alert.find({}, function (err, al) {
        ws2.cell(1, 1).string("Time").style(numStyle);
        ws2.cell(1, 2).string("Date").style(numStyle);
        ws2.cell(1, 3).string("Badge No").style(numStyle);
        ws2.cell(1, 4).string("Name Surname").style(numStyle);
        ws2.cell(1, 5).string("Depatment").style(numStyle);
        ws2.cell(1, 6).string("Block").style(numStyle);
        ws2.cell(1, 7).string("Product Line").style(numStyle);
        ws2.cell(1, 8).string("Product ID").style(numStyle);
        ws2.cell(1, 9).string("Productname").style(numStyle);
        ws2.cell(1, 10).string("STD Length").style(numStyle);
        ws2.cell(1, 11).string("Length").style(numStyle);
        ws2.cell(1, 12).string("STD Weight").style(numStyle);
        ws2.cell(1, 13).string("Weight").style(numStyle);
        ws2.cell(1, 14).string("Line Speed").style(numStyle);

        let row2 = 2;
        for (let i = 0; i < al.length; i++) {
            ws2.cell(row2, 1).string("" + al[i].a_time);
            ws2.cell(row2, 2).string("" + al[i].a_day + " " + al[i].a_date + " " + al[i].a_month + " " + al[i].a_year);
            ws2.cell(row2, 3).string("" + al[i].a_badgeNo);
            ws2.cell(row2, 4).string("" + al[i].a_name + " " + al[i].a_surname);
            ws2.cell(row2, 5).string("" + al[i].a_dept);
            ws2.cell(row2, 6).string("" + al[i].a_block);
            ws2.cell(row2, 7).string("" + al[i].a_productline);
            ws2.cell(row2, 8).string("" + al[i].a_productID);
            ws2.cell(row2, 9).string("" + al[i].a_productName + "-" + al[i].a_productType);
            ws2.cell(row2, 10).string("" + al[i].a_stdlength_min + "-" + al[i].a_stdlength_max);
            ws2.cell(row2, 11).string("" + al[i].a_length);
            ws2.cell(row2, 12).string("" + al[i].a_stdweight_min + "-" + al[i].a_stdweight_max);
            ws2.cell(row2, 13).string("" + al[i].a_weight);
            ws2.cell(row2, 14).string("" + al[i].a_linespeed);
            row2++
        }
        wb2.write('outofstandard.xlsx', function (err, stats) {
            if (err) {
                console.error(err);
            } else {
                console.log(stats); // Prints out an instance of a node.js fs.Stats object
                readfileandsendmail()
            }
        });
    }, (err) => {
        res.status(400).send(err)
    })
    // ========================================
    let wb3 = new xl.Workbook();
    let ws3 = wb3.addWorksheet('Sheet 1');

    let numStyle3 = wb3.createStyle({
        font: {
            color: '#000000',
            size: 12
        },
        numberFormat: '$#,##0.00; ($#,##0.00); -'
    });

    Spotcheck.find({ spot_date: date, spot_day: day, spot_month: month, spot_year: year }, function (err, cur) {
        ws3.cell(1, 1).string("Date").style(numStyle);
        ws3.cell(1, 2).string("Badge No").style(numStyle);
        ws3.cell(1, 3).string("Name").style(numStyle);
        ws3.cell(1, 4).string("Time").style(numStyle);
        ws3.cell(1, 5).string("LINE").style(numStyle);
        ws3.cell(1, 6).string("TYPE").style(numStyle);
        ws3.cell(1, 7).string("SIZE").style(numStyle);
        ws3.cell(1, 8).string("WEIGHT").style(numStyle);
        ws3.cell(1, 9).string("STANDARD WEIGHT/G").style(numStyle);
        ws3.cell(1, 10).string("VARIANCE").style(numStyle);
        ws3.cell(1, 11).string("LENGTH/MM").style(numStyle);
        ws3.cell(1, 12).string("STANDARD LENGTH/MM").style(numStyle);
        ws3.cell(1, 13).string("VARIANCE").style(numStyle);
        ws3.cell(1, 14).string("LINE SPEED").style(numStyle);


        let row = 2;
        let var_weight = "" ;
        for (let j = 0; j < cur.length; j++) {
            ws3.cell(row, 1).string("" + cur[j].spot_day + " " + cur[j].spot_month + " " + cur[j].spot_year);
            ws3.cell(row, 2).string("" + cur[j].spot_badge);
            ws3.cell(row, 3).string("" + cur[j].spot_name + " " + cur[j].spot_surname);
            ws3.cell(row, 4).string("" + cur[j].spot_time);
            ws3.cell(row, 5).string("" + cur[j].spot_productline);
            ws3.cell(row, 6).string("" + cur[j].spot_productname + "-" + cur[j].spot_producttype);
            ws3.cell(row, 7).string("" + cur[j].spot_size);
            ws3.cell(row, 8).string("" + cur[j].spot_weight);
            ws3.cell(row, 11).string("" + cur[j].spot_length);
            ws3.cell(row, 14).string("" + cur[j].spot_linespeed);
            Product.find({ product_name: cur[j].spot_productname, product_type: cur[j].spot_producttypes }, function (err, cur2) {
                ws3.cell(row, 9).string("" + cur2[j].weight_min+"-"+cur2[j].weight_max);
                if(cur[j].spot_weight>cur2[j].weight_max){
                    var_weight = "+"+ cur2[j].weight_max-cur[j].spot_weight            
                }
                ws3.cel
            }, (err) => {
                res.status(400).send(err)
            })
            row++
        }


        wb3.write('spotcheck.xlsx', function (err, stats) {
            if (err) {
                console.error(err);
            } else {
                console.log(stats); // Prints out an instance of a node.js fs.Stats object
                readfileandsendmail()
            }
        });
    }, (err) => {
        res.status(400).send(err)
    })
});

function readfileandsendmail() {
    let data = fs.readFileSync("./outofstandard.xlsx")
    let data2 = fs.readFileSync("./spotcheck.xlsx")

    // =========================== gmail =================================
    // config สำหรับของ gmail
    // var transporter = nodemailer.createTransport({
    //     host: 'smtp.gmail.com',
    //     port: 465,
    //     secure: true, // use SSL
    //     auth: {
    //         user: 'nimamurnee@gmail.com',
    //         pass: '13122540'
    //     }
    // });

    // let mailOptions = {
    //     from: 'sender@hotmail.com',                // sender
    //     to: 'nimamurnee@gmail.com',                // list of receivers
    //     subject: 'Hello from sender',              // Mail subject
    //     html: '<b>Do you receive this mail?</b>'   // HTML body
    //   };

    //   transporter.sendMail(mailOptions, function (err, info) {
    //     if(err)
    //       console.log(err)
    //     else
    //       console.log(info);
    //  });

    // ================================== Ethereal =============================================
    const account = {
        user: "vyynf2arcbp5x4v3@ethereal.email",
        pass: "pVn3AvewcfhuyrSqyT"
    };


    // config Ethereal Email
    let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: account.user, // generated ethereal user
            pass: account.pass // generated ethereal password
        }
    });

    let mailOptions = {
        from: 'admin', // sender address
        to: "aaadd@mail.com", // list of receivers
        subject: "Glove out of standard Report", // Subject line
        text: "Report", // plain text body
        html: "<b>Report Gloves' product that out of standard</b>",// html body
        attachments: [{ 'filename': 'outofstandard.xlsx', 'content': data }],
        attachments: [{ 'filename': 'spotcheck.xlsx', 'content': data2 }]
    }

    transporter.sendMail(mailOptions, function (err, info) {
        // console.log("Message sent: %s", info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    })
    // ======================================== Outlook ====================================

    // var transporter = nodemailer.createTransport({
    //     host: "owa.topglove.com", // hostname
    //     port: 587, // port for secure SMTP
    //     auth: {
    //         user: 'topglove\murnee',
    //         pass: 'murnee13122540'
    //     }
    // });

    // // setup e-mail data, even with unicode symbols
    // var mailOptions = {
    //     from: 'admin', // sender address (who sends)
    //     to: 'topglove\murnee', // list of receivers (who receives)
    //     subject: 'Hello ', // Subject line
    //     text: 'Hello world ' // plaintext body
    //    // html: '<b>Hello world </b><br> This is the first email sent with Nodemailer in Node.js' // html body
    // };

    // // send mail with defined transport object
    // transporter.sendMail(mailOptions, function (error, info) {
    //     if (error) {
    //         console.log('errssssorrrrrrrrrrrrrrrrrrrrr');
    //         console.log(error);
    //     }
    //    // console.log('=====================success======================')
    //    // console.log('Message sent: ' + info.response);
    // });
}

// ############################## User #################
//schedule user side
app.get('/userschedule', (req, res) => {
    let user = {};
    Current.find({}, (err, staffschedule) => {
        if (err) console.log(err)
    }).then((staffschedule) => {
        user.staffschedule = staffschedule

        Block.find({}, (err, block) => {
            if (err) console.log(err)
        }).then((block) => {
            user.block = block
            res.render('user_schedule.hbs', {
                user: encodeURI(JSON.stringify(user))
            })
        })
    }, (err) => {
        res.status(400).send('error')
    })
})

// user login fail
app.get('/userlogin', (req, res) => {
    res.render('user_login.hbs', {})
})

// check login 
app.post('/check_login', (req, res) => {
    let data = {}
    let badgeNo = req.body.badgeNo1
    let emp_password = req.body.password
    Current.findOne({ c_badgeNo: req.body.badgeNo1 }, function (err, result) {
        if (result) {
            Staff.find({
                badgeNo: badgeNo,
                emp_password: emp_password
            }).then((staff) => {
                if (staff.length == 1) {
                    data.Staff = staff
                    //console.log(staff)
                    console.log('login success')
                    // block 
                    StdBlock.find({}, (err, datablock) => {
                        if (err) console.log(err)
                    }).then((datablock) => {
                        data.StdBlock = datablock
                        // product bame , prduct type
                        Product.find({}, (err, dataproduct) => {
                            if (err) console.log(err)
                        }).then((dataproduct) => {
                            data.Product = dataproduct
                            //  Size
                            StdSize.find({}, (err, datasize) => {
                                if (err) console.log(err)
                            }).then((datasize) => {
                                data.StdSize = datasize
                                // Std Length
                                StdLength.find({}, (err, datalength) => {
                                    if (err) console.log(err)
                                }).then((datalength) => {
                                    data.StdLength = datalength
                                    //Std weight
                                    StdWeight.find({}, (err, dataweight) => {
                                        if (err) console.log(err)
                                    }).then((dataweight) => {
                                        data.StdWeight = dataweight

                                        StdProductline.find({}, (err, dataproductline) => {
                                            if (err) console.log(err)
                                        }).then((dataproductline) => {
                                            data.StdProductline = dataproductline

                                            StdProductName.find({}, (err, dataProductname) => {
                                                if (err) console.log(err)
                                            }).then((dataProductname) => {
                                                data.StdProductName = dataProductname

                                                StdProductType.find({}, (err, producttype) => {
                                                    if (err) console.log(err)
                                                }).then((producttype) => {
                                                    data.StdProductType = producttype
                                                    res.render('test_form.hbs', { data: encodeURI(JSON.stringify(data)) })
                                                }, (err) => {
                                                    res.status(400).send(err)
                                                })
                                            })
                                        })
                                    })

                                })

                            })

                        })
                    })
                } else {
                    console.log('error to checking login')
                    res.render('user_login.hbs', {})
                }
            }, (err) => {
                res.status(400).send(err)
            })
        } else {
            console.log('error to find data pls login again')
            res.render('user_login.hbs', result)
        }
    })
})


// save_data when fill information and line notify
app.post('/save_data', (req, res) => {

    let name = "";
    let surname = "";
    let badgeNo = ""
    let time = moment().format('LT');
    let date = moment().format('dddd');
    let day = moment().format('DD');
    let month = moment().format('MMMM')
    let year = moment().format('YYYY')

    if (req.body.block1 && req.body.productline1 && req.body.productname1 && req.body.producttype1 && req.body.productsize1
        && req.body.length1 && req.body.weight1 && req.body.linespeed1) {
        Current.findOne({ c_badgeNo: req.body.badge1 }).then((c) => {

            name = c.c_name
            surname = c.c_surname

            var length1 = req.body.length1
            var weight1 = req.body.weight1
            console.log(length1)
            console.log(weight1)

            Product.findOne({ product_type: req.body.producttype1, product_name: req.body.productname1 }).then((d) => {

                Block.findOne({ productLine: req.body.productline1 }, function (err, data) {
                    if (data) {
                        data.badgeNo = c.c_badgeNo
                        data.save(function (err) {
                            if (err)
                                console.log('== Fail to update badgeNo in Block table ')
                            else
                                console.log('== Success to update badgeNo in Block table ')
                        })
                    } else {
                        console.log(err)
                    }

                })

                let length_min = parseFloat(d.length_min);
                let length_max = parseFloat(d.length_max);
                let weight_min = parseFloat(d.weight_min);
                let weight_max = parseFloat(d.weight_max);

                //Chack length 
                if (length1 > length_max) {
                    console.log('!!!!!OVER length !!!!!')
                    request({
                        method: 'POST',
                        uri: 'https://notify-api.line.me/api/notify',
                        header: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        auth: {
                            bearer: 'lZCZt4ehQD2q68XKhkgEMcHYs4yncRuM5VX0LSzaOrb', //token
                        },
                        form: {
                            message: 'Product Name : ' + d.product_name + '-' + d.product_type + '  SIZE : ' + d.product_size + ' is OVER LENGTH !!!!! ', //ข้อความที่จะส่ง

                        },
                    }, (err, httpResponse, body) => {
                        if (err) {
                            console.log(err)
                        } else {
                            console.log(body)
                        }
                    })
                }
                if (length1 < length_min) {
                    console.log('!!!!!UNDER length !!!!!')
                    request({
                        method: 'POST',
                        uri: 'https://notify-api.line.me/api/notify',
                        header: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        auth: {
                            bearer: 'lZCZt4ehQD2q68XKhkgEMcHYs4yncRuM5VX0LSzaOrb', //token
                        },
                        form: {
                            message: 'Product Name : ' + d.product_name + '-' + d.product_type + '  SIZE : ' + d.product_size + ' is UNDER LENGTH !!!!! น้อยกว่ามาตรฐาน', //ข้อความที่จะส่ง

                        },
                    }, (err, httpResponse, body) => {
                        if (err) {
                            console.log(err)
                        } else {
                            console.log(body)
                        }
                    })
                }

                // Check Weight
                if (weight1 < weight_min) {
                    console.log(' !!!! UNDER weight !!!!!')
                    request({
                        method: 'POST',
                        uri: 'https://notify-api.line.me/api/notify',
                        header: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        auth: {
                            bearer: 'lZCZt4ehQD2q68XKhkgEMcHYs4yncRuM5VX0LSzaOrb', //token
                        },
                        form: {
                            message: 'Product Name : ' + d.product_name + '-' + d.product_type + '  SIZE : ' + d.product_size + ' is UNDER WEIGHT !!!!!', //ข้อความที่จะส่ง

                        },
                    }, (err, httpResponse, body) => {
                        if (err) {
                            console.log(err)
                        } else {
                            console.log(body)
                        }
                    })

                }
                if (weight1 > weight_max) {
                    console.log(' !!!! Over weight !!!!!')
                    request({
                        method: 'POST',
                        uri: 'https://notify-api.line.me/api/notify',
                        header: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        auth: {
                            bearer: 'lZCZt4ehQD2q68XKhkgEMcHYs4yncRuM5VX0LSzaOrb', //token
                        },
                        form: {
                            message: 'Product Name : ' + d.product_name + '-' + d.product_type + '  SIZE : ' + d.product_size + ' is OVER WEIGHT !!!!!', //ข้อความที่จะส่ง

                        },
                    }, (err, httpResponse, body) => {
                        if (err) {
                            console.log(err)
                        } else {
                            console.log(body)
                        }
                    })

                }

                if (length1 > length_max || length1 < length_min || weight1 < weight_min || weight1 > weight_max) {
                    let newAlert2 = new Alert({
                        a_time: time,
                        a_day: day,
                        a_date: date,
                        a_month: month,
                        a_year: year,
                        a_badgeNo: c.c_badgeNo,
                        a_name: name,
                        a_surname: surname,
                        a_dept: c.c_department,
                        a_block: req.body.block1,
                        a_productline: req.body.productline1,
                        a_productID: d.product_id,
                        a_productName: d.product_name,
                        a_productType: d.product_type,
                        a_stdlength_min: d.length_min,
                        a_stdlength_max: d.length_max,
                        a_stdweight_min: d.weight_min,
                        a_stdweight_max: d.weight_max,
                        a_length: req.body.length1,
                        a_weight: req.body.weight1,
                        a_linespeed: req.body.linespeed1
                    })
                    newAlert2.save().then((doc) => {
                        console.log('saving data to ALERT table success')
                    })
                }
            }, (err) => {
                res.status(400).send(err)
            })
            let newSpotscheck = new Spotcheck({
                spot_badge: req.body.badge1,
                spot_name: name,
                spot_surname: surname,
                spot_time: time,
                spot_date: date,
                spot_day: day,
                spot_month: month,
                spot_year: year,
                spot_block: req.body.block1,
                spot_productline: req.body.productline1,
                spot_productname: req.body.productname1,
                spot_producttype: req.body.producttype1,
                spot_size: req.body.productsize1,
                spot_length: req.body.length1,
                spot_weight: req.body.weight1,
                spot_linespeed: req.body.linespeed1
            })
            newSpotscheck.save().then((doc) => {
                console.log('success to save data on SPOTCHECK ====1==== table')

                let check = "checked"
                // save status to Current block 
                Current.findOne({ c_badgeNo: req.body.badge1 }, function (err, current) {
                    if (current) {
                        current.c_status = check
                        current.save(function (err) {
                            if (err) // do something
                                console.log('is fail to update status on CURRENT table')
                            else
                                console.log('is UPdated status on CURRENT table')

                            // save status to Current block 
                            Schedule.findOne({ s_badgeNo: req.body.badge1 }, function (err, schedule) {
                                if (schedule) {
                                    schedule.s_status = check
                                    schedule.save(function (err) {
                                        if (err) // do something
                                            console.log('is fail to update status on SCHEDULE table')
                                        else
                                            console.log('is UPdated status on SCHEDULE table')
                                    });
                                } else {
                                    console.log(err)
                                }
                            })
                        });
                    } else {
                        console.log(err)
                    }
                })
                res.render('user_success.hbs')
            })
        })
    } else {
        res.send('Please fill corrrect information in form 1')
    }
})


//########################################  Port #################################################
// app.listen(process.env.PORT || 3000, () => {
//     console.log('listin port 3000')
// })
app.listen(3000, () => {
    console.log('listin port 3000')
})