const express = require('express');
const app = express();


const { default: Conf } = require('conf');

const store = new Conf();

// const allUser = ({
//     userName: "",
//     userEmail: "",
//     userPassword: "",
//     userPassword2: "",
//     userPhone: ""
// })

const router = new express.Router();

// app.use(require('./models/User'));


router.route('/login')
    .get((req,res)=>{
        res.render('login',{});
    })
    .post((req,res)=> {
        // console.log(req.body);
        const Login_uname = req.body.uname;
        const Login_pswd = req.body.pswd;
        console.log(Login_uname);

        var data = JSON.parse(store.get('userArray') || '[]');
        console.log(data);
        console.log(data.length);

        console.log(data[1].username , "\n here we go\n");



        for(let i =0;i<data.length;i++){
            if(Login_uname === data[i].username && Login_pswd === data[i].psw1){
                console.log("success");
                store.set('userIndex',i);
                console.log(userIndex);

                res.redirect('/user');
    
            }
            else{
            }
        }










})

router.route('/new')
    .get((req,res)=>{
        res.render('new',{});
    })
    .post((req,res)=> {
        //console.log(req.body);    
        
        const username = req.body.uname;
        const email = req.body.email;
        const pswd1 = req.body.psw1;
        const pswd2 = req.body.psw2;
        const phno = req.body.phoneno;

        console.log(email);


        var newUser = JSON.parse(store.get('userArray') || '[]');

        newUser.push({
            username,
            email,
            pswd1,
            pswd2,
            phno
        })
        // store.set ('userArray',[
        //     username,
        //     email,
        //     pswd1,
        //     pswd2,
        //     phno
        // ]);


        store.set('userArray', JSON.stringify(newUser));

        const allUser = JSON.parse(store.get('userArray'|| '[]'));
        // store.clear();
        console.log(allUser);
        console.log("we are here \n");
        console.log(allUser[0].email);


    })


router.route('/user')
    .get((req,res)=>{
        res.render('user',{});
    })
    .post((req,res)=> {
        console.log(req.body);
})

module.exports = router;





