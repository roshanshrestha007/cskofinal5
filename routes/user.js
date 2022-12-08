/*

Q) What happens if there is no user in the system, since signup redirects to login again.
=> when there is no user in the system, remove middleware "sessionOut" function from signup .get, save it
-> and then navigate to "localhost:3500/new"; to add 1st user of the system.
   p.s don't forget to add "sessionOut" back to signup .get, to secure signup page after 1st user is added. 

*/

const express = require('express');
const app = express();
var cookieParser = require("cookie-parser");
const uuid = require('uuid'); //for uniquie user ids
app.use(cookieParser());

const { default: Conf } = require('conf'); //Used to store user details, never do it in real world applications. Use DB instead

const store = new Conf();


//store.clear();  // To clear storage incase of garbage values. Warining : it will delete all current users.

const router = new express.Router();

//clear cookie if no user session.
app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.sessionID) {
        res.clearCookie("user_sid");
    }
    next();
});

//middleware function to check session, redirects to account
var sessionChecker = (req, res, next) => {
    if (req.session.sessionID && req.cookies.user_sid) {
        uids = req.session.sessionID;

        res.redirect(`/${uids}`);
    } else {
        next();
    }
};

//middleware function to check session, redirects to login
var sessionOut = (req, res, next) => {
    if (req.session.sessionID == undefined && req.cookies.user_sid == undefined) {
        console.log("Session Logged out, current session:", req.session.sessionID);
        res.redirect(`/login`);
    } else {
        next();
    }
};


//routes for login page
router.route('/login')
    .get(sessionChecker, (req, res) => {
        var data = JSON.parse(store.get('userArray') || '[]');
        //console.log('We are inside login \n' + data);
        var ind = store.get('index');

        if (data == '' && ind == undefined) {
            //console.log("inside if stare..")
            res.render('login', {
                notlogged: '1', message: {
                    type: 'warning',
                    title: 'No users in the system! Sign up first'
                }
            });
        }
        else {
            const sessionid = req.session.sessionID;
            // console.log("Session id assigned: ",sessionid);

            // console.log("inside else");
            var data = JSON.parse(store.get('userArray') || '[]');
            var ind = store.get('index');
            const username = data[ind].uname;
            res.render('login', { notlogged: '1', userName: username });

        }

    })
    .post((req, res) => {
        const Login_uname = req.body.uname;
        const Login_pswd = req.body.pswd;
        var data = JSON.parse(store.get('userArray') || '[]');
        console.log(data);

        // console.log("Before for loop");
        console.log("The size of array is :" + data.length);

        for (let i = 0; i < data.length; i++) {
            // console.log("loop  " + i)
            if ((Login_uname === data[i].username) && (Login_pswd === data[i].pswd1)) {
                // console.log("success");
                store.set('index', i);
                // console.log(store.get('index'));
                var flg = '1';
                break;
            }
            else {
                // console.log("The else statement")
                var flg = '0';
            }
        }
        indy = store.get('index')
        // console.log("here is indy",indy);

        if (indy == undefined && data == '') {
            res.render('login', {
                notlogged: '1', message: {
                    type: 'warning',
                    title: 'No users in the system! Sign up first'
                }
            });


        }
        else {
            var uids = data[indy].uniqId

        }

        if (flg == '1') {
            // console.log("inside flag 1");
            req.session.sessionID = uids;
            sessionidhere = req.session.sessionID;
            // console.log("session id here: ",sessionidhere);
            res.redirect(`/${uids}`);
        }
        else if (flg == '0') {
            console.log("Details don't match.");
            res.render('login', {
                message: {
                    type: 'warning',
                    title: 'Account details donot match',
                }, notlogged: '1'
            })
        }


    })


//routes for sign up page
router.route('/new')
    .get(sessionOut, (req, res) => {

        res.render('new', { logged: '1' }); //"logged" variable is used in header handlebars


    })
    .post((req, res) => {

        const uniqId = uuid.v1();
        const username = req.body.uname;
        const email = req.body.email;
        const pswd1 = req.body.psw1;
        const pswd2 = req.body.psw2;
        const phno = req.body.phoneno;



        var Signupdata = JSON.parse(store.get('userArray') || '[]');

        for (let i = 0; i < Signupdata.length; i++) {
            // console.log("loop  " + i)
            if ((username === Signupdata[i].username)) {
                console.log("Username taken");
                var flgSign = '1';
                break;
            }
            else if ((email === Signupdata[i].email)) {
                console.log("Email taken");
                var flgSign = '2';
                break;
            }
            else {
                // console.log("The else statement")
                var flgSign = '0';
            }
        }

        if (flgSign == '1') {
            console.log("Username already in system");
            res.render('new', {
                message: {
                    type: 'warning',
                    title: 'Username is taken',
                }, logged: '1'
            })
        }
        else if (flgSign == '2') {
            console.log("Email already in system");
            res.render('new', {
                message: {
                    type: 'warning',
                    title: 'User with this Email already exist',
                }, logged: '1'
            })
        }
        else if (!username || !email || !pswd1 || !phno || pswd1 !== pswd2) {
            console.log("Password Doesnot match");
            res.render('new', {
                message: {
                    type: 'warning',
                    title: 'Password donot match',
                }, logged: '1'
            })

        }
        else {
            var newUser = JSON.parse(store.get('userArray') || '[]');
            newUser.push({
                uniqId,
                username,
                email,
                pswd1,
                pswd2,
                phno
            })

            store.set('userArray', JSON.stringify(newUser));

            const allUser = JSON.parse(store.get('userArray' || '[]'));
            console.log(allUser);
            // console.log(allUser.length);
            const i = allUser.length - 1;
            store.set('index', i);
            // console.log("we are here \n");
            var useruID = allUser[i].uniqId    // user's unique id as useruID
            req.session.sessionID = useruID;  // user's unique id as session id
            console.log("New user added.")
            res.redirect(`/logout`);    // According to PA4 description, redirected to login after user sucessfully signups and logout the current user.

        }
    })

//routes of logout
router.route('/logout')
    .get((req, res) => {
        console.log("User logged out!");
        res.clearCookie("user_sid"); //clears cookies 
        req.session.destroy(() => { }); //destroies the session
        res.redirect('/login')
    });



router.route('/:userID')
    .get((req, res) => {
        // console.log("Got userId sucessfully: ", req.params.userID);

        const userids = req.params.userID;
        if (userids === '') {
            // console.log("User Doesn't exist");
            res.render('404', {
                alert: {
                    type: 'warning',
                    title: 'Page donot work',
                }, notlogged: '1'
            })


        }

        // console.log(userids);

        var data = JSON.parse(store.get('userArray') || '[]');


        //Search for matching user id and Assign i to index
        for (let i = 0; i < data.length; i++) {
            if (userids === data[i].uniqId) {
                store.set('index', i);
                // console.log("success");
                var UseFlg = '1';
                break;

            }
            else {
                var UseFlg = '0';
            }

        }



        var sess = req.session.sessionID;   //assign session id
        // console.log("session var id is:",sess);




        //user matches and session id matches and cookie created
        if (UseFlg == '1' && sess == userids && req.cookies.user_sid) {
            const ind = store.get('index');
            const uniqid = data[ind].uniqId;
            const DisEmail = data[ind].email;

            const DisPhno = data[ind].phno;
            const DisPwd = data[ind].pswd1;
            const uName = data[ind].username;

            res.render('user', {
                logged: '1', sameuser: '1', userID: uniqid, userName: uName, email: DisEmail, phno: DisPhno, password: DisPwd, message: req.flash('message'), failmessage: req.flash('failmessage')
            });

        }
        //user matches but session id doesn't match (different user data)
        else if (UseFlg == '1' && sess !== userids && req.cookies.user_sid) {
            const ind = store.get('index');
            const uniqid = data[ind].uniqId;
            const DisEmail = data[ind].email;

            console.log("Showing Different account. You can't edit.");
            const DisPhno = data[ind].phno;
            const DisPwd = data[ind].pswd1;
            const uName = data[ind].username;

            res.render('user', {
                diffuser: '1', userID: uniqid, userName: uName, email: DisEmail, phno: DisPhno, password: DisPwd, message: req.flash('message'), failmessage: req.flash('failmessage')
            });

        }
        else if (UseFlg == '1' && sess && req.cookies.user_sid) {
            const ind = store.get('index');
            const uniqid = data[ind].uniqId;
            const DisEmail = data[ind].email;

            console.log(DisEmail);
            const DisPhno = data[ind].phno;
            console.log(DisPhno);
            const DisPwd = data[ind].pswd1;
            const uName = data[ind].username;

            res.render('user', {
                logged: '1', sameuser: '1', userID: uniqid, userName: uName, email: DisEmail, phno: DisPhno, password: DisPwd, message: req.flash('message'), failmessage: req.flash('failmessage')
            });

        }
        else {
            // console.log("User Doesn't exist");
            res.redirect('login')


        }




    })
    .post((req, res) => {
        // console.log(req.body);
        const upduuid = req.body.upduuid;
        const updUserName = req.body.upduname;
        const updUserEmail = req.body.updemail;
        const updUserPhone = req.body.updphno;
        const updUserPass = req.body.psw1;

        console.log("\nThis is the update part")


        var usrs = JSON.parse(store.get('userArray') || '[]')
        var sessvar = req.session.sessionID;
        


        if (sessvar === upduuid) {
            // console.log("Session var and user id match");
            for (let i = 0; i < usrs.length; i++) {
                if (upduuid === usrs[i].uniqId) {
                    store.set('index', i);
                    var userFlg = '1';
                    break;
                }
                else {
                    var userFlg = '0';
                }
            }

        }
        else {
            var userFlg = '404';


        }



        if (userFlg == '1') {

            const indx = store.get('index');
            // console.log(usrs[indx].username);
            var uidz = usrs[indx].uniqId;

            for (let j = 0; j < usrs.length; j++) {
                if ((usrs[j].username === updUserName) && (upduuid !== usrs[j].uniqId)) {
                    console.log("username taken");
                    // store.set('index',i);
                    // console.log(store.get('index'));
                    var updflag = '1';
                    break;
                }
                else if ((updUserEmail === usrs[j].email) && (upduuid !== usrs[j].uniqId)) {
                    console.log("email taken");
                    var updflag = '2';
                    break;
                }
                else {
                    var updflag = '0';
                }

            }

            if (updflag === '1') {
                req.flash('failmessage', 'Username is already taken')
                res.redirect(`/${uidz}`);
            }
            else if (updflag === '2') {
                req.flash('failmessage', 'Email is already taken')
                res.redirect(`/${uidz}`);
            }
            else if (updflag === '0') {
                console.log("\n\n Updating...........")

                usrs[store.get('index')].username = updUserName;
                usrs[store.get('index')].email = updUserEmail;
                usrs[store.get('index')].phno = updUserPhone;
                // console.log(usrs);
                store.set('userArray', JSON.stringify(usrs));
                console.log("\n\n This is the array after updating");
                console.log(JSON.parse(store.get('userArray' || '[]')))

                req.flash('message', 'User Successfully updated!')

                req.session.sessionID = upduuid;
                res.redirect(`/${upduuid}`);
                console.log("User:", updUserName, "updated");

            }
            else {
                res.redirect(`/${uidz}`);
            }

        }
        else if (userFlg == '404') {
            req.flash('failmessage', 'You are not allowed to update others account, Redirecting you to your own account.');
            res.redirect(`/${sessvar}`);

        }
        else {
            req.flash('message', 'Unique id doesnot match');
            res.redirect(`/${upduuid}`);




        }





    })



module.exports = router;