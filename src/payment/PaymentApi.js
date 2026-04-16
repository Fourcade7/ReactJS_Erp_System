





async function getAllPaymentListPaginationSearch(page,limit,search){

   

    try{
        let response = await fetch(`http://localhost:3000/payment/allpagsearch?page=${page}&limit=${limit}&search=${search}`,{ 
            method:"GET"

        });

        const result = await response.json();
        //console.log(result);
        
        return result;


    }catch(error){
        console.log("Catch Error:",error);
        
    }

}









export {getAllPaymentListPaginationSearch}