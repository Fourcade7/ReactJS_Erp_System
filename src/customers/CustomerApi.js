


async function addCustomer(username,surname,phone) {
    try {
        let response = await fetch(`http://109.196.103.18:3000/customer/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                surname,
                phone,
                type:"user" 
                
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



async function updateCustomer(
  id,
  username,
  surname,
  phone,
 
) {
  try {

    const body = {};

    if (username) body.username = username;
    if (surname) body.surname = surname;
    if (phone) body.phone = phone;
   

    const response = await fetch(`http://109.196.103.18:3000/customer/update/${id}`, {
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


async function deleteCustomer(id){

   

    try{
        let response = await fetch(`http://109.196.103.18:3000/customer/delete/${id}`,{ 
            method:"DELETE"

        });

        //const result = await response.json();
        //console.log(result);
        
        return response;


    }catch(error){
        console.log("Catch Error:",error);
        
    }

}

async function getAllUsersPagination(page,limit){

   

    try{
        let response = await fetch(`http://109.196.103.18:3000/user/allpag?page=${page}&limit=10`,{ 
            method:"GET"

        });

        const result = await response.json();
        //console.log(result);
        
        return result;


    }catch(error){
        console.log("Catch Error:",error);
        
    }

}


async function getAllCustomersPaginationSearch(page,limit,search){

   

    try{
        let response = await fetch(`http://109.196.103.18:3000/customer/allpagsearch?page=${page}&limit=${limit}&search=${search}`,{ 
            method:"GET"

        });

        const result = await response.json();
        //console.log(result);
        
        return result;


    }catch(error){
        console.log("Catch Error:",error);
        
    }

}

export {getAllUsersPagination,deleteCustomer,updateCustomer,getAllCustomersPaginationSearch,addCustomer}