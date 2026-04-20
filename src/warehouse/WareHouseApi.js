


async function updateWareHouse(
  id,
  name,
  weight
) {
  try {

    const body = {};

    if (name) body.name = name;
    if (weight) body.weight = Number(weight);
    

    const response = await fetch(`http://109.196.103.18:3000/warehouse/update/${id}`, {
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


async function deleteWareHouse(id){

   

    try{
        let response = await fetch(`http://109.196.103.18:3000/warehouse/delete/${id}`,{ 
            method:"DELETE"

        });

        //const result = await response.json();
        //console.log(result);
        
        return response;


    }catch(error){
        console.log("Catch Error:",error);
        
    }

}


async function getAllWareHouse(){

   

    try{
        let response = await fetch(`http://109.196.103.18:3000/warehouse/all`,{ 
            method:"GET"

        });

        //const result = await response.json();
        //console.log(result);
        
        return response;


    }catch(error){
        console.log("Catch Error:",error);
        
    }

}

async function addWareHouse(name,weight) {
    try {
        let response = await fetch(`http://109.196.103.18:3000/warehouse/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                
                name:name,
                weight:Number(weight)
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

export {addWareHouse,getAllWareHouse,deleteWareHouse,updateWareHouse}