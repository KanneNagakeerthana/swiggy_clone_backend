const Firm = require('../models/Firm');
const Vendor = require('../models/Vendor');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Multer storage configuration

const storage = multer.diskStorage({
         destination:function(req, file, cb){
             cb(null, "uploads/"); // Directory to save uploaded files
         },
         filename:function(req, file, cb){
             cb(null, Date.now()+path.extname(file.originalname));
         },
     });

// Multer middleware instance
const upload = multer({ storage: storage });

// Add a firm controller function
const addFirm = async (req, res) => {
    try {
        console.log("Body Received:", req.body); // Logs the body
        console.log("File Uploaded:", req.file); // Logs the uploaded file

        const { firmName, area, category, region, offer } = req.body;
        const image = req.file ? req.file.filename : undefined;

        console.log("Filename:", req.file?.filename); // Should print the filename
        console.log("Firm Name:", firmName);
       // console.log(req.body);
       // const { firmName, area, category, region, offer } = req.body;
       // const image = req.file ? req.file.filename : undefined;
        console.log(req.file?.filename);
        console.log(firmName);

        // Check if vendor exists
        const vendor = await Vendor.findById(req.vendorId);
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }

        if(vendor.firm.length > 0) {
            return res.status(400).json({message:'vendor can have only one firm'});
        }
        console.log(vendor._id);

        // Create a new firm
        const firm = new Firm({
            firmName,
            area,
            category,
            region,
            offer,
            image,
            vendor: vendor._id,
        });
        console.log("Hello worls");
        // Save the firm and link it to the vendor
       const savedFirm = await firm.save();
       const firmId = savedFirm._id;
       //await firm.save();
        //console.log("gm")
        vendor.firm.push(savedFirm);
        //console.log("a applsc")
      await vendor.save();
        //console.log("ball")
        return res.status(200).json({ message: "Firm added successfully", firmId});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const deleteFirmById = async(req, res)=>{
    try {
        const firmId = req.params.firmId;

        const deletedFirm = await Firm.findByIdAndDelete(firmId);

        if(!deletedFirm) {
            return res.status(404).json({error:"No firm found"});
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Internal server error"});
    }
}
// Export the upload middleware and addFirm function
module.exports = { addFirm: [upload.single('image'), addFirm], deleteFirmById  };

