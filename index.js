const express= require("express")
const { MongoClient, ServerApiVersion } = require('mongodb');
const { v4: uuidv4 } = require("uuid");
const ObjectId = require("mongodb").ObjectId;
require('dotenv').config();
const cors = require("cors");
const bcrypt = require('bcryptjs');
const axios = require("axios");
const http = require("http");
const { Server } = require("socket.io");
const crypto = require('crypto');
const app=express();
const port = process.env.PORT || 5000;
// app.use(express.json({ limit: '50mb' }));
const server = http.createServer(app);
const io = new Server(server);
app.use(express.urlencoded({ extended: true }));
app.use(cors())
app.use(express.json())


  // newlandingpage 
// 96KlHwz2RO8AwpjK 
const uri = `mongodb+srv://newlandingpage:96KlHwz2RO8AwpjK@cluster0.4awdg7q.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fqcn4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });


async function run() {

  try{
      await client.connect();
      console.log("connected to database");
      const database = client.db('Overseas');
      const homeProjectCollection = database.collection('HomeProject');     
      const userCollection = database.collection('users');
      const bannerpostCollection = database.collection('bannerposts');
      const cashcategoryCollection = database.collection('cashcategory');
      const productdataCollection = database.collection("productsdata");
      const paymentCollection = database.collection("payment");
      const navberpostCollection = database.collection('navber');
      const footerpostCollection = database.collection('footer');
      const aboutpostCollection = database.collection('about');
      const blogpostCollection = database.collection('blog');
      const offerpostCollection = database.collection('offer');
      const latestproductcollection = database.collection('latestproduct');


      

    // Fetch chat historyapi/form-submit
 // Fetch chat history


  // Add a new product
  app.post("/postProductdata", async (req, res) => {
    try {
      const data = req.body;
      const result = await productdataCollection.insertOne(data);
      res.send({ insertedId: result.insertedId });
    } catch (error) {
      res.status(500).send({ error: "Failed to add product" });
    }
  });
  app.post("/postlatest", async (req, res) => {
    try {
      const data = req.body;
      const result = await latestproductcollection.insertOne(data);
      res.send({ insertedId: result.insertedId });
    } catch (error) {
      res.status(500).send({ error: "Failed to add product" });
    }
  });

  app.post("/offerpost", async (req, res) => {
    try {
      const data = req.body;
      const result = await offerpostCollection.insertOne(data);
      res.send({ insertedId: result.insertedId });
    } catch (error) {
      res.status(500).send({ error: "Failed to add product" });
    }
  });

  app.get("/getoffer", async (req, res) => {
    const products = await offerpostCollection.find({}).toArray();
    res.send(products);
  });
 

  // Get all products
  app.get("/getproducts", async (req, res) => {
    const products = await productdataCollection.find({}).toArray();
    res.send(products);
  });
  app.get("/blogpart", async (req, res) => {
    const products = await blogpostCollection.find({}).toArray();
    res.send(products);
  });

  // Get a single product by ID 
    app.get("/product/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const product = await productdataCollection.findOne({ _id: new ObjectId(id) });
        res.send(product);
      } catch (error) {
        res.status(500).send({ error: "Invalid ID format" });
      }
    });

    // ✅ Get related products
    app.get("/related-products/:related", async (req, res) => {
      try {
        const relatedCategory = req.params.related;
        console.log("Fetching related products for:", relatedCategory);
    
        // Ensure proper filtering (case insensitive match)
        const relatedProducts = await productdataCollection
          .find({ related: { $regex: new RegExp(`^${relatedCategory}$`, "i") } }) // Case insensitive
          .toArray();
    
        res.json(relatedProducts);
      } catch (error) {
        console.error("Error fetching related products:", error);
        res.status(500).json({ error: "Failed to fetch related products" });
      }
    });
    
    
    app.post('/init', async (req, res) => {
      try {
        const { cartProducts, total_amount,  product_name,  cus_name, cus_email, date, status, address,  cus_postcode, District, payment_number, phone } = req.body;
        
        if (!cartProducts || !cus_name || !cus_email) {
          return res.status(400).json({ message: 'Missing required fields' });
        }
        
        const email = cartProducts.map((data) => data.buyerEmail);
        const adminemail = cartProducts.map((data) => data.adminEmail);
        
        // Calculate total income
        const totalIncome = cartProducts.reduce((acc, data) => acc + (data.totalIncome || 0), 0);
    
        const data = {
          emails: email,
          admindata: adminemail,
          total_amount: total_amount || 0,
          Totalincome: totalIncome,
          tran_id: uuidv4(),
          shipping_method: 'Courier',
          product_name: product_name || 'Default Product Name',
          cus_name,
          cus_email,
          phone,
          date,
          status,
          cartProducts,
          product_image: 'https://i.ibb.co/t8Xfymf/logo-277198595eafeb31fb5a.png',
          address,
          cus_add2: 'Dhaka',
          cus_postcode,
          District,
          payment_number,
         
        };
    
        const order = await paymentCollection.insertOne(data);
        console.log(data);
        res.status(200).json({ message: 'Order successfully inserted', orderId: order.insertedId });
      } catch (error) {
        console.error('Error processing order:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    });

    app.get('/userMy', async (req, res) => {
      try {
        const email = req.params.email; // Extract the email from the URL
        const tickets = await paymentCollection.find({ }).toArray(); // Query by email
        res.json(tickets);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tickets' });
      }
    });

    app.delete("/manageAllOrderDelete/:id", async (req, res) => {
      const { id } = req.params;
    
      try {
        // Convert id to ObjectId
        const objectId = new ObjectId(id);
        
        // Attempt to delete the document
        const result = await paymentCollection.deleteOne({ _id: objectId });
    
        // Check if deletion was successful
        if (result.deletedCount === 0) {
          return res.status(404).json({ message: 'Order not found' });
        }
    
        // Respond with success
        res.status(200).json({ message: 'Order deleted successfully' });
      } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ message: 'An error occurred while deleting the order' });
      }
    });



app.get("/getcategoryparts", async (req, res) => {
  const result = await cashcategoryCollection.find({}).toArray();
  res.json(result);
});

 // details show product 
 app.get('/product/:id', async(req,res)=>{
  const id=req.params.id
  const query={_id: new ObjectId(id)}
  const result=await cashcategoryCollection.findOne(query)
  res.json(result)
});

 const ENCRYPTION_KEY = '12345678901234567890123456789012'; 
const IV = crypto.randomBytes(16);

function encryptData(data) {
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'utf8'), IV);
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return IV.toString('hex') + ':' + encrypted;
}

// Decryption function
function decryptData(encryptedData) {
  const [ivHex, encryptedHex] = encryptedData.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const encryptedText = Buffer.from(encryptedHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'utf8'), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return JSON.parse(decrypted.toString());
}


 











// baner post collection 

app.post('/postaddbanner', async (req, res) => {
  try {
    const { title,link,time,  image } = req.body;

    // Insert the data into the MongoDB collection
    const result = await bannerpostCollection.insertOne({
      title,
      link,
      time,
      image,
      createdAt: new Date(),
    });

    // Check if insert was successful and return the inserted data
    if (result.acknowledged) {
      res.status(201).json({
        message: 'Award added successfully',
        data: {
          _id: result.insertedId,
          title,
          image,
          createdAt: new Date(),
        },
      });
    } else {
      res.status(500).json({ message: 'Error adding banner' });
    }
  } catch (error) {
    console.error('Error adding banner:', error);
    res.status(500).json({ message: 'Error adding banner' });
  }
});


app.get("/getbannerdata", async (req, res) => {
  const result = await bannerpostCollection.find({}).toArray();
  res.json(result);
});

app.get("/editbaners/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const user = await bannerpostCollection.findOne(query);
  res.json(user);
});
app.get("/editoffer/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const user = await offerpostCollection.findOne(query);
  res.json(user);
});
app.get("/editproductdata/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const user = await productdataCollection.findOne(query);
  res.json(user);
});
app.get("/editabouts/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const user = await aboutpostCollection.findOne(query);
  res.json(user);
});
app.get("/editblogs/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const user = await blogpostCollection.findOne(query);
  res.json(user);
});



app.put('/bannerdataupdate/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title,link, time, image } = req.body;
    

    const objectId = new ObjectId(id);
      const result = await bannerpostCollection.updateOne(
      { _id: objectId }, 
      {
        $set: {
          title,
          link,
          time,
          image,
        },
      }
    );

    if (result.modifiedCount > 0) {
      res.json({ message: 'Award updated successfully', modifiedCount: result.modifiedCount });
    } else {
      res.status(404).json({ message: 'Banner not found or no changes made' });
    }
  } catch (error) {
    console.error('Error updating banner:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});
app.put('/offerupdate/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title,size, code,discount,related,ProductPrice,oldPrice, image } = req.body;
    
    const objectId = new ObjectId(id);
      const result = await offerpostCollection.updateOne(
      { _id: objectId }, 
      {
        $set: {
          title,size, code,discount,related,ProductPrice,oldPrice,
          image,
        },
      }
    );

    if (result.modifiedCount > 0) {
      res.json({ message: 'Award updated successfully', modifiedCount: result.modifiedCount });
    } else {
      res.status(404).json({ message: 'Banner not found or no changes made' });
    }
  } catch (error) {
    console.error('Error updating banner:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});
app.put('/productdataupdate/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title,size, code,discount,category,ProductPrice,description, image } = req.body;
    
    const objectId = new ObjectId(id);
      const result = await productdataCollection.updateOne(
      { _id: objectId }, 
      {
        $set: {
          title,size, code,discount,category,ProductPrice,description,
          image,
        },
      }
    );

    if (result.modifiedCount > 0) {
      res.json({ message: 'Award updated successfully', modifiedCount: result.modifiedCount });
    } else {
      res.status(404).json({ message: 'Banner not found or no changes made' });
    }
  } catch (error) {
    console.error('Error updating banner:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});


app.put('/aboutdataupdate/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title,description, image } = req.body;
    

    const objectId = new ObjectId(id);
      const result = await aboutpostCollection.updateOne(
      { _id: objectId }, 
      {
        $set: {
          title,
          description,
          image,
        },
      }
    );

    if (result.modifiedCount > 0) {
      res.json({ message: 'Award updated successfully', modifiedCount: result.modifiedCount });
    } else {
      res.status(404).json({ message: 'Banner not found or no changes made' });
    }
  } catch (error) {
    console.error('Error updating banner:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});


app.put('/blogdataupdate/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title,description,content, image } = req.body;
    

    const objectId = new ObjectId(id);
      const result = await blogpostCollection.updateOne(
      { _id: objectId }, 
      {
        $set: {
          title,
          description,
          content,
          image,
        },
      }
    );

    if (result.modifiedCount > 0) {
      res.json({ message: 'Award updated successfully', modifiedCount: result.modifiedCount });
    } else {
      res.status(404).json({ message: 'Banner not found or no changes made' });
    }
  } catch (error) {
    console.error('Error updating banner:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});



// navber 

app.post('/postaddnavber', async (req, res) => {
  try {
    const { home,about,contact,offer,allads,career,  image } = req.body;

    // Insert the data into the MongoDB collection
    const result = await navberpostCollection.insertOne({
      home,
      about,
      contact,
      offer,
      allads,
      career,
      image,
      createdAt: new Date(),
    });

    // Check if insert was successful and return the inserted data
    if (result.acknowledged) {
      res.status(201).json({
        message: 'Award added successfully',
        data: {
          _id: result.insertedId,
          home,
          about,
          contact,
          offer,
          allads,
          career,
          image,
          createdAt: new Date(),
        },
      });
    } else {
      res.status(500).json({ message: 'Error adding banner' });
    }
  } catch (error) {
    console.error('Error adding banner:', error);
    res.status(500).json({ message: 'Error adding banner' });
  }
});


app.get("/getnavber", async (req, res) => {
  const result = await navberpostCollection.find({}).toArray();
  res.json(result);
});

app.get("/editnavbers/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const user = await navberpostCollection.findOne(query);
  res.json(user);
});


app.delete("/bannerpartdelete/:id", async (req, res) => {
  const result = await bannerpostCollection.deleteOne({
    _id: new ObjectId(req.params.id),
  });
  res.json(result);
});
app.delete("/offerpartdelete/:id", async (req, res) => {
  const result = await offerpostCollection.deleteOne({
    _id: new ObjectId(req.params.id),
  });
  res.json(result);
});
app.delete("/productdatadelete/:id", async (req, res) => {
  const result = await productdataCollection.deleteOne({
    _id: new ObjectId(req.params.id),
  });
  res.json(result);
});


app.put('/navberdataupdate/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { home,about,contact,offer,allads,career, image } = req.body;
    

    const objectId = new ObjectId(id);
      const result = await navberpostCollection.updateOne(
      { _id: objectId }, 
      {
        $set: {
          home,
      about,
      contact,
      offer,
      allads,
      career,
          image,
        },
      }
    );

    if (result.modifiedCount > 0) {
      res.json({ message: 'Award updated successfully', modifiedCount: result.modifiedCount });
    } else {
      res.status(404).json({ message: 'Banner not found or no changes made' });
    }
  } catch (error) {
    console.error('Error updating banner:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});


// footer 
app.get("/api/footer", async (req, res) => {
  try {
    const footerData = await footerpostCollection.find({}).toArray();

    res.json(footerData);
  } catch (error) {
    console.error("Error fetching footer data:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});



app.get("/footer/:id", async (req, res) => {
  try {
    const footerId = req.params.id;
    if (!ObjectId.isValid(footerId)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const footer = await footerpostCollection.findOne({ _id: new ObjectId(footerId) });

    if (!footer) {
      return res.status(404).json({ error: "Footer not found" });
    }

    res.json(footer);
  } catch (error) {
    console.error("Error fetching footer:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 📌 Update footer data by ID
app.put("/footer/:id", async (req, res) => {
  try {
    const footerId = req.params.id;
    const updatedFooterData = req.body;

    console.log("Received ID:", footerId);
    console.log("Received Footer Data:", updatedFooterData);

    // Validate the ID format
    if (!ObjectId.isValid(footerId)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    // Check if the document exists before updating
    const footerToUpdate = await footerpostCollection.findOne({ _id: new ObjectId(footerId) });

    if (!footerToUpdate) {
      return res.status(404).json({ error: "Footer not found" });
    }

    // Exclude _id field from the update data if it exists in the request body
    const { _id, ...footerWithoutId } = updatedFooterData;

    const result = await footerpostCollection.updateOne(
      { _id: new ObjectId(footerId) },
      { $set: footerWithoutId } // Only update fields without _id
    );

    console.log("Update Result:", result); // Log the result of the update operation

    if (result.modifiedCount === 0) {
      return res.status(400).json({ error: "No changes made to the footer" });
    }

    res.json({ message: "Footer updated successfully" });
  } catch (error) {
    console.error("Error updating footer:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/getfooters", async (req, res) => {
  const result = await footerpostCollection.find({}).toArray();
  res.json(result);
});


// about 
app.get("/aboutparts", async (req, res) => {
  const result = await aboutpostCollection.find({}).toArray();
  res.json(result);
});















 









// unread message 




























     
 // add database user collection 
 app.post('/users', async (req, res) => {

  try {
    // Check if the phone number already exists
    const decryptedData = decryptData(req.body.payload);
    const { displayName, password, phoneNumber } = decryptedData;
    const existingUser = await userCollection.findOne({ phoneNumber });

    if (existingUser) {
      return res.status(400).json({ success: false, message: "Phone number already registered. Please log in." });
    }

    // Insert new user
    const result = await userCollection.insertOne({  displayName,password, phoneNumber });
    res.json({ success: true, message: "User registered successfully!", result });
  } catch (error) {
    console.error("Error inserting user:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});



 app.post('/postdatarecruitment', async(req,res)=>{
  const user=req.body;
  console.log(req.body)
  const result=await postrecruitmentCollection.insertOne(user);
  res.json(result);
 
})












 
  

  



  // sms 

  const otpStore = {};
  const BULKSMSBD_API_KEY = process.env.DB_SMS;
const SENDER_ID = process.env.DB_SMSID;

// console.log("API Key:", BULKSMSBD_API_KEY);
// console.log("Sender ID:", SENDER_ID);
  
  
  // Axios instance for BulkSMSBD API
  const axiosInstance = axios.create({
    baseURL: "http://sms.joypurhost.com/api",
  });
  
  // 1. Send OTP
  app.post("/send-otp", async (req, res) => {
    const { phoneNumber } = req.body;
  
    // Validate phone number (Bangladeshi 11-digit number in international format)
    if (!/^\d{11}$/.test(phoneNumber)) {
      return res.status(400).json({ success: false, message: "Invalid phone number." });
    }
  
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP
    otpStore[phoneNumber] = otp;
  
    try {
      const formattedPhoneNumber = `88${phoneNumber}`;  // Ensure phone number is in international format
  
      // URL encode the message to ensure proper transmission
      const message = encodeURIComponent(`Your OTP is: ${otp}`);
  
      const response = await axiosInstance.get(
        `/smsapi?api_key=${BULKSMSBD_API_KEY}&number=${formattedPhoneNumber}&message=${message}&type=text&senderid=${SENDER_ID}`
      );
  
      // Log the full response from BulkSMSBD for debugging
      console.log("BulkSMSBD Response:", response.data);
  
      // Adjusted success check
      if (response.data.response_code === 1000 || response.data.response_code === 202) {
        res.json({ success: true });
      } else {
        res.status(500).json({ success: false, message: response.data.error_message || "Failed to send SMS." });
      }
    } catch (error) {
      console.error("Error in send-otp:", error.message);
      res.status(500).json({ success: false, message: "Error sending OTP.", error: error.message });
    }
  });

  
// 2. Verify OTP
app.post("/verify-otp", (req, res) => {
  const { phoneNumber, otp } = req.body;

  if (otpStore[phoneNumber] === otp) {
    delete otpStore[phoneNumber]; // Clear OTP after successful verification
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false, message: "Invalid OTP." });
  }
});






  // database searching check admin 
  app.get('/userLogin/:phone', async(req,res)=>{
    const phone=req.params.phone;
    console.log(phone)
    const query={phoneNumber:phone}
    console.log(query)
    const user=await userCollection.findOne(query)
    console.log(user)
    let isAdmin=false;
    if(user?.role==='admin'){
      isAdmin=true;
    }
    res.json({admin:isAdmin})
});

// database check subadmin 
app.get('/userLoginsubadmin/:phone', async(req,res)=>{
  const phone=req.params.phone;
  const query={phoneNumber:phone}
  const user=await userCollection.findOne(query)
  let issubAdmin=false;
  if(user?.subrole==='subadmin'){
    issubAdmin=true;
  }
  res.json({subadmin:issubAdmin})
});


app.get("/getuserdats", async (req, res) => {
  try {
    const { phone } = req.query; // Use query parameters to get the email

    if (!phone) {
      return res.status(400).json({ message: "Email is required." });
    }

    const userData = await userCollection.findOne({phoneNumber: phone }); // Find one user by email

    if (!userData) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json(userData); // Return the user data
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});


app.get("/getuserphone", async (req, res) => {
  try {
    const { phone } = req.query;

    if (!phone) {
      return res.status(400).json({ message: "Phone number is required." });
    }

    const userData = await userCollection.findOne({ phoneNumber: phone });

    if (!userData) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json(userData); // Send user data directly (not an array)
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});






app.put("/api/update-user", async (req, res) => {
  try {
    const {  name, phone, district, upazila } = req.body;

    // Validate required fields
    if ( !name || !phone || !district || !upazila) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Update user data in the database
    const updatedUser = await userCollection.findOneAndUpdate(
      {phoneNumber: phone }, // Find user by email
      { $set: { displayName: name, phone, district, upazila } }, // Update fields
      { returnDocument: "after", returnOriginal: false } // Return the updated document
    );

    

    res.json({
      message: "User updated successfully.",
      user: updatedUser.value, // Send the updated user details
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});


// admin list 
app.get("/getadminlist", async (req, res) => {
  const result = await userCollection.find({}).toArray();
  res.json(result);
});

// block user 
app.patch("/blockuser/:phoneNumber", async (req, res) => {
  const userPhone = req.params.phoneNumber;
  try {
      const result = await userCollection.updateOne(
          { phoneNumber: userPhone },
          { $set: { status: "blocked" } }
      );

      if (result.modifiedCount > 0) {
          res.json({ success: true, message: "User blocked successfully." });
      } else {
          res.status(404).json({ success: false, message: "User not found." });
      }
  } catch (error) {
      res.status(500).json({ success: false, message: error.message });
  }
});


// unblock user 
// Unblock user
app.patch("/unblockuser/:phoneNumber", async (req, res) => {
  const userPhone = req.params.phoneNumber;
  try {
      const result = await userCollection.updateOne(
          { phoneNumber: userPhone },
          { $set: { status: "active" } }
      );

      if (result.modifiedCount > 0) {
          res.json({ success: true, message: "User unblocked successfully." });
      } else {
          res.status(404).json({ success: false, message: "User not found." });
      }
  } catch (error) {
      res.status(500).json({ success: false, message: error.message });
  }
});


// chck the database block check 

app.get('/usersblock/:phoneNumber', async (req, res) => {
  const { phoneNumber } = req.params;
  const user = await userCollection.findOne({ phoneNumber }); // Fix query to check phoneNumber

  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

// Reset Password Route

app.put("/reset-password", async (req, res) => {
  try {
    const { phoneNumber, newPassword } = req.body;

    if (!phoneNumber || !newPassword) {
      return res.status(400).json({ success: false, message: "All fields are required!" });
    }

    

    // Find user by phone number
    const user = await userCollection.findOne({ phoneNumber });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found!" });
    }

    // Update password in MongoDB (plain text)
    const result = await userCollection.updateOne(
      { phoneNumber },
      { $set: { password: newPassword } }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({ success: false, message: "Password update failed!" });
    }

    res.json({ success: true, message: "Password updated successfully!" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ success: false, message: "Server error. Try again!" });
  } 
});



 // database admin create the new admin
 app.put("/userLogin/admin", async (req, res) => {
  const user = req.body;
  console.log("put", user);
  const filter = { phoneNumber: user.phoneNumber }; // Match by phone number
  const updateDoc = { $set: { role: "admin" } };
  const result = await userCollection.updateOne(filter, updateDoc);
  res.json(result);
});

// database admin create the new admin
app.put("/userLogin/subadmin", async (req, res) => {
  const user = req.body;
  console.log("put", user);
  const filter = { phoneNumber: user.phoneNumber }; // Match by phone number
  const updateDoc = { $set: { subrole: "subadmin" } };
  const result = await userCollection.updateOne(filter, updateDoc);
  res.json(result);
});

// Delete Admin
app.delete("/userLogin/admin/:phoneNumber", async (req, res) => {
  const { phoneNumber } = req.params;

  try {
    const result = await userCollection.deleteOne({ phoneNumber: phoneNumber });

    if (result.deletedCount > 0) {
      res.json({ success: true, message: "Admin deleted successfully", deletedCount: result.deletedCount });
    } else {
      res.status(404).json({ success: false, message: "Admin not found" });
    }
  } catch (error) {
    console.error("Error deleting admin:", error);
    res.status(500).json({ success: false, error: "Failed to delete admin" });
  }
});

// deleet subadmin 
app.delete("/userLogin/subadmin/:phoneNumber", async (req, res) => {
  const { phoneNumber } = req.params;

  try {
    const result = await userCollection.deleteOne({ phoneNumber: phoneNumber });

    if (result.deletedCount > 0) {
      res.json({ success: true, message: "Admin deleted successfully", deletedCount: result.deletedCount });
    } else {
      res.status(404).json({ success: false, message: "Admin not found" });
    }
  } catch (error) {
    console.error("Error deleting admin:", error);
    res.status(500).json({ success: false, error: "Failed to delete admin" });
  }
});



// post pproject home 
app.post('/postproject', async (req, res) => {
  try {
    const { title, description, image } = req.body;

    // Insert the data into the MongoDB collection
    const result = await homeProjectCollection.insertOne({
      title,
      description,
      image,
      createdAt: new Date(),
    });

    // Check if insert was successful and return the inserted data
    if (result.acknowledged) {
      res.status(201).json({
        message: 'Banner added successfully',
        data: {
          _id: result.insertedId,
          title,
          description,
          image,
          createdAt: new Date(),
        },
      });
    } else {
      res.status(500).json({ message: 'Error adding banner' });
    }
  } catch (error) {
    console.error('Error adding banner:', error);
    res.status(500).json({ message: 'Error adding banner' });
  }
});

app.get('/users/:email', async (req, res) => {
  const email = req.params.email;
  const query = { email: email };
  // console.log(query)
  const user = await userCollection.findOne(query);

  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

















      
      app.get("/getcareerwork", async (req, res) => {
        const result = await CareerworkCollection.find({}).toArray();
        res.json(result);
      });
      app.get("/getcareerglobal", async (req, res) => {
        const result = await CareerglobalCollection.find({}).toArray();
        res.json(result);
      });
     
      


      app.get("/getcitydetails/:countryId/:cityName", async (req, res) => {
        const { countryId, cityName } = req.params;
      
        try {
          // Ensure countryId is treated as an ObjectId
          const country = await contactpartaddressCollection.findOne({ _id: new ObjectId(countryId) });
      
          if (!country) {
            return res.status(404).send("Country not found");
          }
      
          // Find city with case-insensitive match for cityName
          const city = country.cities.find(
            (c) => c.name.toLowerCase() === cityName.toLowerCase()
          );
      
          if (!city) {
            return res.status(404).send("City not found");
          }
      
          // Include country flag in the response
          res.json({
            ...city,
            countryFlag: country.flag, // Add the flag of the country to the response
            country: country.country // Include the country name
          });
        } catch (error) {
          console.error("Error fetching city details:", error);
          res.status(500).send("Internal server error");
        }
      });
      
      


      

    // update data
    app.put("/bannerupdate/:id", async (req, res) => {
      
      const { id } = req.params;
      const { heading, description, media } = req.body;
  
      const updateResult = await homebannerCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { heading, description, media } }
      );
   res.json(updateResult);
  }); 

  


  
  

  app.delete("/awardsclientsdelete/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const result = await awardclientsCollection.deleteOne({ _id: new ObjectId(id) });
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: "Award not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting award", error });
    }
  });

  



  




  }

  finally{
      // await client.close();
  }
}

run().catch(console.dir)

   app.get('/', (req,res)=>{
    res.send("online shopping");
   });
  
 app.listen(port, ()=>{
    console.log("runnning online on port", port);
  }); 
