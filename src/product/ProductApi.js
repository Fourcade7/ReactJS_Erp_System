


async function updateProduct(
  id,
  name,
  barCode,
  price,
  bulkPrice,
  buyPrice,
  categoryId,
  unit
 
) {
  try {

    const body = {};

    if (name) body.name = name;
    if (barCode) body.barCode = barCode;
    if (price) body.price = price;
    if (bulkPrice) body.bulkPrice = bulkPrice;
    if (buyPrice) body.buyPrice = buyPrice;
    if (categoryId) body.categoryId = categoryId;
    if (unit) body.unit = unit;
   

    const response = await fetch(`http://109.196.103.18:3000/product/update/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    //const data = await response.json();
    return response;
  } catch (error) {
    console.error(error);
  }
}

async function updateProductWImage(
  id,
  name,
  barCode,
  price,
  bulkPrice,
  buyPrice,
  image,
  categoryId,
  unit
) {
  try {
    const formData = new FormData();

    if (name) formData.append("name", name);
    if (barCode) formData.append("barCode", barCode);
    if (price) formData.append("price", price);
    if (bulkPrice) formData.append("bulkPrice", bulkPrice);
    if (buyPrice) formData.append("buyPrice", buyPrice);
    if (categoryId) formData.append("categoryId", categoryId);
    if (unit) formData.append("unit", unit);

    
    if (image) {
      formData.append("image", image);
    }

    const response = await fetch( `http://109.196.103.18:3000/product/update/${id}`,
      {
        method: "PATCH",
        body: formData, 
      }
    );

    return response;
  } catch (error) {
    console.error(error);
  }
}




async function deleteProduct(id){

   

    try{
        let response = await fetch(`http://109.196.103.18:3000/product/delete/${id}`,{ 
            method:"DELETE"

        });

        //const result = await response.json();
        //console.log(result);
        
        return response;


    }catch(error){
        console.log("Catch Error:",error);
        
    }

}



async function getAllProductPaginationSearch(page,limit,search){

   

    try{
        let response = await fetch(`http://109.196.103.18:3000/product/allpagsearch?page=${page}&limit=${limit}&search=${search}`,{ 
            method:"GET"

        });

        const result = await response.json();
        console.log(result);
        
        return result;


    }catch(error){
        console.log("Catch Error:",error);
        
    }

}


async function getAllWareHouse(){

   

    try{
        let response = await fetch(`http://109.196.103.18:3000/warehouse/all`,{ 
            method:"GET"

        });

        const result = await response.json();
        //console.log(result);
        
        return result;


    }catch(error){
        console.log("Catch Error:",error);
        
    }

}


async function addProduct(name,barCode,price,bulkPrice,buyPrice,categoryId) {
    try {
        let response = await fetch(`http://109.196.103.18:3000/product/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                
                name:name,
                barCode,
                price,
                bulkPrice,
                buyPrice,
                categoryId:Number(categoryId),
                unit:"Штук"
                
            })
        });

        // const result = await response.json();
        // //console.log(result);
        // console.log(response.status);

        return response;

    } catch (error) {
        console.log("Catch Error:", error);
    }
}


async function addStock(productId,warehouseId,userId,quantity) {
    try {
        let response = await fetch(`http://109.196.103.18:3000/stock/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                product_id:productId,
                warehouse_id:warehouseId,
                user_id:userId,
                quantity                
            })
        });

        // const result = await response.json();
        // //console.log(result);
        // console.log(response.status);

        return response;

    } catch (error) {
        console.log("Catch Error:", error);
    }
}

export {getAllProductPaginationSearch,addProduct,deleteProduct,updateProduct,getAllWareHouse,addStock,updateProductWImage}