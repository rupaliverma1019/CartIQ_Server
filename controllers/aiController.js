const Product =
require("../models/Product");

const {
askGemini
}
=
require("../services/geminiService");

const searchProductsAI =
async(req,res)=>{

try{

const {prompt}=req.body;

if(!prompt){

return res.status(400).json({

success:false,

message:"Prompt is required"

});

}

const aiPrompt=`

You are an ecommerce shopping assistant.

User request:

"${prompt}"

Return only comma separated keywords.

Example:

mobile,samsung,electronics

`;

const keywords=
await askGemini(aiPrompt);

const keywordArray=
keywords
.split(",")
.map(item=>item.trim());

const searchQuery={

$or:[

{

title:{

$regex:
keywordArray.join("|"),

$options:"i"

}

},

{

description:{

$regex:
keywordArray.join("|"),

$options:"i"

}

},

{

category:{

$regex:
keywordArray.join("|"),

$options:"i"

}

},

{

brand:{

$regex:
keywordArray.join("|"),

$options:"i"

}

}

]

};

const products=
await Product.find(searchQuery);

return res.json({

success:true,

keywords,

count:products.length,

products

});

}
catch(error){

return res.status(500).json({

success:false,

message:error.message

});

}

};

module.exports={

searchProductsAI

};