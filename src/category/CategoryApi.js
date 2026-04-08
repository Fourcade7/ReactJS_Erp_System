


async function updateCategory(
  id,
  name
 
) {
  try {

    const body = {};

    if (name) body.name = name;
   
    

    const response = await fetch(`http://localhost:3000/category/update/${id}`, {
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


async function deleteCategory(id){

   

    try{
        let response = await fetch(`http://localhost:3000/category/delete/${id}`,{ 
            method:"DELETE"

        });

        //const result = await response.json();
        //console.log(result);
        
        return response;


    }catch(error){
        console.log("Catch Error:",error);
        
    }

}


async function getAllCategory(){

   

    try{
        let response = await fetch(`http://localhost:3000/category/all`,{ 
            method:"GET"

        });

        //const result = await response.json();
        //console.log(result);
        
        return response;


    }catch(error){
        console.log("Catch Error:",error);
        
    }

}



async function addCategory(name,weight) {
    try {
        let response = await fetch(`http://localhost:3000/category/add`, {
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

export {addCategory,getAllCategory ,deleteCategory,updateCategory}