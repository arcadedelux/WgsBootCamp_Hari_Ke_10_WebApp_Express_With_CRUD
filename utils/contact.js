const { Console } = require('console')
const fs = require('fs')
const validator = require('validator')

// Inisiasi Node readline
// const readline = require('readline')

// const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout
//   })

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

  // Fungsi Menanyakan Data dengan readlines module dari node
  // const questions=(ask)=>{
  //   return new Promise((resolve)=>{
  //       rl.question(ask,(data)=>{
  //           resolve(data)
  //       })
  //   })
  // }

//Untuk Menampilkan/Load Data File Contacts.json
const loadContact=()=>{
    const file = fs.readFileSync('data/contacts.json','utf-8')
        const contacts=JSON.parse(file)
        return contacts
}

//Untuk memasukan data input ke contact.json dengan validasi
 const saveData =(name,phone,email)=>{
    const contact = {name,phone,email}
    //Code Untuk Menload File Json dan di parse jadi objek biasa untuk diba ca oleh script javascript
    // const file = fs.readFileSync('data/contacts.json','utf-8')
    //     const contacts=JSON.parse(file)
      const contacts=loadContact()
        const checkName= contacts.find(e=> e.name === name)
        const checkMobile = validator.isMobilePhone(phone,'id-ID')
        const checkEmail = validator.isEmail(email)
        if(checkName){
          console.log("Maaf Nama Sudah Ada!")
        }
        else if(!checkMobile && !checkEmail){
          console.log("Penulisan Nomer Hp dan Email Salah!")
        }else if(!checkMobile){
         console.log("Silahkan Masukan Format Penulisan Nomer Hand Phone Yang Benar!")
        }else if(!checkEmail){
          console.log("Silahkan Masukan Penulisan Format Email Salah!")
        }else{
          contacts.push(contact)
          fs.writeFileSync('data/contacts.json',JSON.stringify(contacts))
          console.log('terimakasih sudah menginput data!')
  }}

  //Fungsi Menampilkan Data Dari Contacts.json
  const listContacts=()=>{
    const contacts = loadContact()
    console.log('contact List: ')
    contacts.forEach((contact,i) =>{
      console.log(`${i+1}.${contact.name} - ${contact.phone}`)
    })
  }
  //Fungsi Menampilkan Detai Contact Bedasarkan Nama
  const detailContact=(name)=>{
    const contacts= loadContact()
    const details = contacts.find(e=>e.name === name)

    if(!details){
      console.log(`${name} Tidak ditemukan`)
      return false
    }
    return details
  //  for(elem in details){
  //   console.log(`${elem} : ${details[elem]}`)
  //  }
  }

  //Fungsi Delete Data dari contacts.json
  const deleteContact =(name)=>{
    const contacts= loadContact()
    
    //Delete Menggunakan Metode Filter
    // const del = contacts.filter(e=>e.name !== name)
    // fs.writeFileSync('data/contacts.json',JSON.stringify(del))
    // console.log('data sudah terhapus')

    const index = contacts.findIndex(item => item.name === name);
    contacts.splice(index,1)
    fs.writeFileSync('data/contacts.json',JSON.stringify(contacts))
    console.log('data sudah terhapus')
  }

  //Fungsi Update Contact
  const updateContact =(newContact)=>{
    const contacts= loadContact()
    const key =newContact.oldName
    const details = contacts.find(e=>e.name === key)

    if(details){
      details.name = newContact.name
    
      details.phone = newContact.phone
     
      details.email =newContact.email

      fs.writeFileSync('data/contacts.json',JSON.stringify(contacts))

    }
     
  }
  // const updateContact =(newContact)=>{
  //   const contacts= loadContact()
  //   //fungsi menghilangkan contact lama yang namanya sama dengan oldName
  //   const details = contacts.filter(contact=>contact.name !== newContact.oldName)
  //   delete newContact.oldName

  //   details.push(newContact)

  //  fs.writeFileSync('data/contacts.json',JSON.stringify(details))
  // }
module.exports={saveData,listContacts,detailContact,deleteContact,updateContact}