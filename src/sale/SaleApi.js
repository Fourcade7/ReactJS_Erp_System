





async function getAllSaleListPaginationSearch(page,limit,search){

   

    try{
        let response = await fetch(`http://109.196.103.18:3000/sale/allpagsearch?page=${page}&limit=${limit}&search=${search}`,{ 
            method:"GET"

        });

        const result = await response.json();
        //console.log(result);
        
        return result;


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
        //console.log(result);
        
        return result;


    }catch(error){
        console.log("Catch Error:",error);
        
    }

}






async function addNewSale(orderList,totalCost) {

   
    
    const items = orderList.map(item=>(
        {
        product_id: item.id,
        warehouse_id: item.stock?.[0]?.warehouse?.id,
        quantity: item.quantity,
        price: item.buyPrice 
       }
    ))

    const payments =[{
        method:"cash",
        amount:totalCost
    }];
    




    try {
        let response = await fetch(`http://109.196.103.18:3000/sale/addfull`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                customer_id:1,
                user_id:1,
                discount:0,
                items,
                payments                               
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





export {getAllProductPaginationSearch,addNewSale,getAllSaleListPaginationSearch}