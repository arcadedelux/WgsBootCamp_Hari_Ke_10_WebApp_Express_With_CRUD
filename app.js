// const http = require('http')
const fs = require('fs')
const express = require('express')
const expressLayouts = require('express-ejs-layouts');
const morgan = require('morgan')
const session =require('express-session')
const Parsercookie =require('cookie-parser')
const { body, validationResult, check } = require('express-validator')
var flash = require('connect-flash');
const {updateContact,detailContact, deleteContact} =require('./utils/contact')
const app =express()
const port =3000



// configuirasi flash 
app.use(Parsercookie('secret'))

app.use(session({
  cookie:{maxAge:6000},
  secret:'secret',
  resave:true,
  saveUninitialized:true
}))

app.use(flash());
//Kode untuk menggunakan 3rd party middleware morgan di server kita
app.use(morgan('dev'))
//Kode untuk menggunakan view engine ejs dengan perintah render
app.set('view engine','ejs')
//Kode untuk menggunakan depedency express layout
app.use(expressLayouts);
//Kode Untuk Menampilkan fil2 seperti image di express js dan membuat folder public 
app.use(express.static('public'));

//default set layout to all views page if your app have single layout dan tidak perlu di app.get ditambahkan layout
// app.set('layout','layout/layoutEjs')

//middle ware untk binding data dari halaman html
app.use(express.urlencoded({extended:true}))


//error handling membuat folder data apabila tidak ada
const dirPath='./data'
if(!fs.existsSync(dirPath)){
  fs.mkdirSync(dirPath)
}

//error handling Membuat filecontacts.json jika belum ada
const dataPath='./data/contacts.json'
if(!fs.existsSync(dataPath)){
  fs.writeFileSync(dataPath,'[]','utf-8')
}

//Untuk Menampilkan/Load Data File Contacts.json
const loadContact=()=>{
  const file = fs.readFileSync('data/contacts.json','utf-8')
      const contacts=JSON.parse(file)
      return contacts
}
//Untuk menyimpan Data File Contacts.json
const saveContact=(data)=>{
  const contacts =loadContact()
  contacts.push(data)
  fs.writeFileSync('data/contacts.json',JSON.stringify(contacts))
}


//Fungsi Mencari Duplikat nama
const copy =(name)=>{
  const contacts=loadContact()
  const checkName= contacts.find(e=> e.name === name)
  return checkName
} 


//Menggunakan middleware
app.use((req, res, next) => {
  console.log('Time:', Date.now())
   next()
})

//Perintah Express js untuk menerima request alamat url mana yang mau di akses dan merender file html dengan mengirimkan data ke halaman html
app.get('/',(req, res)=> {
//   res.send('Hello World')
const name ="Arief Setyabudi"
const title ="Web Server Node Ejs"
const contacts = loadContact()
//Pakai Cara ini jika app memiliki berbagaimacam layout,dengan memasukan layout:'(alamatfile layoutnya)'
const layoutEjs ='layout/layoutEjs'
res.render('index',{layout:layoutEjs,name:name,title:title,contacts})
})

//Perintah Express js untuk menerima request alamat url mana yang mau di akses dan merender file html
app.get('/about',(req, res)=> {
  const title ="About Page"
  //Pakai Cara ini jika app memiliki berbagaimacam layout,dengan memasukan layout:'(alamatfile layoutnya)'
  const layoutEjs ='layout/layoutEjs'
    // res.send('This about page')
    res.render('about',{layout:layoutEjs,title:title})
  })

 
//Perintah Express js untuk menerima request alamat url mana yang mau di akses dan merender file html
app.get('/contact',(req, res)=> {
    // res.send('This about page')
    const contacts = loadContact()
    const title ="Contact Page"
    //Pakai Cara ini jika app memiliki berbagaimacam layout,dengan memasukan layout:'(alamatfile layoutnya)'
    const layoutEjs ='layout/layoutEjs'
    res.render('contact',{layout:layoutEjs,title:title,contacts:contacts,msg:req.flash('msg')})
  })

 //Perintah untuk menginput input dari url dan mengirim data ke halaman html
 app.get('/contact/:name',(req, res)=> {
  // res.send('This about page')

  const title ="Contact Page"
  const name =req.params.name
  const detail = detailContact(name)
  //Pakai Cara ini jika app memiliki berbagai macam layout,dengan memasukan layout:'(alamatfile layoutnya)'
  const layoutEjs ='layout/layoutEjs'
  res.render('details',{detail,layout:layoutEjs,title })
})

//Perintah untuk menmbah data ke contact.json
  app.get('/contact/add',(req, res)=> {
    // res.send('This about page')
  
    const title ="Contact Page"
    const layoutEjs ='layout/layoutEjs'
    res.render('addContact',{layout:layoutEjs,title, errors:'' })
  })

  app.post('/contact',[
    body('name').custom(name=> {
    const checkName = copy(name)
         
         if(checkName){
          throw new Error("Nama Sudah Ada")
         }
         return true
  }), check('email',"email Tidak Valid").isEmail(),
  check('phone','Nomer Tidak Valid').isMobilePhone('id-ID')],(req, res)=> {
    const errors = validationResult(req)
    const layoutEjs ='layout/layoutEjs'
    const title ="Contact Page"
    //Jika Tidak Valid
    if(!errors.isEmpty()){
      //chek apakah fungsi validasi sudah jalan
      // return res.status(400).json({errors:errors.array()})
      res.render('addContact',
      {
        layout:layoutEjs,
        title,
        errors: errors.array()
      })
      
    }else{ const name =req.body.name
      const phone =req.body.phone
      const email =req.body.email
      const data={name,phone,email}
      saveContact(data)}
      //mengirim flash message ke halaman add contact
      req.flash('msg','Data Contact berhasil ditambahkan')
      res.redirect('/contact')
   
  })

  //Delete data contact
  app.get('/contact/delete/:name',(req, res)=>{
    const name =req.params.name
    deleteContact(name)
    req.flash('msg','Data Berhasil Dihapus!')
  res.redirect('/contact')
  })

  //halaman Edit data contac
  app.get('/contact/edit/:name',(req, res)=>{
    const title='Edit Contact'
    const layout='layout/layoutEjs'
    const name =req.params.name
    const getDataContactByName = detailContact(name)
    
    res.render('editContact',{title,layout,getDataContactByName,errors:''})
  })
 
  //Cara untuk edit dan mengupdate contacts.json 
  app.post('/contact/edit',[
    body('name').custom((value,{req})=> {
    const checkName = copy(value)
         
         if(value !== req.body.oldName && checkName  ){
          throw new Error("Nama Sudah Ada")
         }
         return true
  }),
   check('email',"email Tidak Valid").isEmail(),
  check('phone','Nomer Tidak Valid').isMobilePhone('id-ID')],
  (req, res)=> {
    const errors = validationResult(req)
    const getDataContactByName = detailContact(req.body.oldName)
    const layoutEjs ='layout/layoutEjs'
    const title ="Edit Contact Page"
    //Jika Tidak Valid
    if(!errors.isEmpty()){
      //chek apakah fungsi validasi sudah jalan
      // return res.status(400).json({errors:errors.array()})
      res.render('editContact',
      {
        getDataContactByName,
        layout:layoutEjs,
        title,
        errors: errors.array(),
      })
      
    }else{ 
      const name =req.body.name
      const phone =req.body.phone
      const email =req.body.email
      const oldName =req.body.oldName
      const data={name,phone,email,oldName}
      updateContact(data)
    }

      //mengirim flash message ke halaman add contact
      req.flash('msg','Data Contact berhasil ditambahkan')
      res.redirect('/contact')
   
  })


  // //Perintah Express js untuk menerima request alamat url mana yang mau di akses dan merender sesuatu mengirim input ke url menggunakan param dan query
  // app.get('/product/:id',(req,res)=>{
  //   // res.send('product id :'+ req.params.id + '<br></br>'
  //   //  + 'category id :' + req.query.category)
  //   // let id =req.params.id
  //   res.send(`product id : ${req.params.id} <br> cathegory id : ${req.query.category}`)
    
  // })

//Error handler dengan menggunakan use express.js
  app.use('/',(req,res)=>{
    res.status(404)
    res.send('Not Found : 404')
})

//Asign port server kita memakai port akses yang mana fungsi untuk menangkap request http dan mengembalikan respon http 
app.listen(port,()=>{
    console.log(`Server On Port ${port}`)
})


