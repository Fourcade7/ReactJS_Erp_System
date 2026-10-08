import { API_BASE } from '../config/api'






async function getAllPaymentListPaginationSearch(page,limit,search){

   

    try{
        let response = await fetch(`${API_BASE}/payment/allpagsearch?page=${page}&limit=${limit}&search=${encodeURIComponent(search ?? "")}`,{ 
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