

async function getAllSaleToday(){

   

    try{
        let response = await fetch(`http://localhost:3000/sale/alltoday`,{ 
            method:"GET"

        });

        //const result = await response.json();
        //console.log(result);
        
        return response;


    }catch(error){
        console.log("Catch Error:",error);
        
    }

}


async function getAllSaleWeek(){

   

    try{
        let response = await fetch(`http://localhost:3000/sale/allweek`,{ 
            method:"GET"

        });

        //const result = await response.json();
        //console.log(result);
        
        return response;


    }catch(error){
        console.log("Catch Error:",error);
        
    }

}

async function getAllSaleMonth(){

   

    try{
        let response = await fetch(`http://localhost:3000/sale/allmonth`,{ 
            method:"GET"

        });

        //const result = await response.json();
        //console.log(result);
        
        return response;


    }catch(error){
        console.log("Catch Error:",error);
        
    }

}


export {getAllSaleToday,getAllSaleWeek,getAllSaleMonth}