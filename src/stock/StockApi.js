


async function updateStock(
  id,
  product_id,
  warehouse_id,
  quantity
    
) {
  try {

    const body = {};

    if (product_id) body.product_id = product_id;
    if (warehouse_id) body.warehouse_id = warehouse_id;
    if (quantity) body.quantity = quantity;
    
   

    const response = await fetch(`http://localhost:3000/stock/update/${id}`, {
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




async function deleteStock(id){

   

    try{
        let response = await fetch(`http://localhost:3000/stock/delete/${id}`,{ 
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
        let response = await fetch(`http://localhost:3000/product/allpagsearch?page=${page}&limit=${limit}&search=${search}`,{ 
            method:"GET"

        });

        const result = await response.json();
        //console.log(result);
        
        return result;


    }catch(error){
        console.log("Catch Error:",error);
        
    }

}


async function getAllWareHouse(){

   

    try{
        let response = await fetch(`http://localhost:3000/warehouse/all`,{ 
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
        let response = await fetch(`http://localhost:3000/product/add`, {
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


async function addStock(productId,warehouseId,quantity) {
    try {
        let response = await fetch(`http://localhost:3000/stock/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                product_id:productId,
                warehouse_id:warehouseId,
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


async function getAllStockPaginationSearch(page,limit,search){

   

    try{
        let response = await fetch(`http://localhost:3000/stock/allpagsearch?page=${page}&limit=${limit}&search=${search}`,{ 
            method:"GET"

        });

        const result = await response.json();
        //console.log(result);
        
        return result;


    }catch(error){
        console.log("Catch Error:",error);
        
    }

}

export {getAllStockPaginationSearch,getAllProductPaginationSearch,addProduct,deleteStock,updateStock,getAllWareHouse,addStock}
