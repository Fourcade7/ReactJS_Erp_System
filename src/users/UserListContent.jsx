
import { ListGroup,Button } from "react-bootstrap";

import { useEffect, useState } from "react";

import Pagination from 'react-bootstrap/Pagination';
import { getAllUsersPagination } from "./UserApi";



function PaginationExample() {
  const [active, setActive] = useState(1);

  let items = [];

  for (let number = 1; number <= 5; number++) {
    items.push(
      <Pagination.Item
        key={number}
        active={number === active}
        onClick={() => setActive(number)} // 🔥 click handler
      >
        {number}
      </Pagination.Item>
    );
  }

  return (
    <div className="mt-4">
      <Pagination>{items}</Pagination>
      <br />
      <p>Active page: {active}</p>
    </div>
  );
}


function UserListGroup() {
 


  const [userList,setUserList] = useState([]);
  const [pageCount,setPageCount] = useState(0);
  

  const [active, setActive] = useState(1);

  useEffect(()=>{
    async function loadAllUserPag() {
      try{
        const userListPag= await getAllUsersPagination(active,10);
        console.log(userListPag);
        setPageCount(userListPag.meta.totalPages);
        console.log(active);
        setUserList(userListPag.data)
        
        
        
      }catch(error){

      }
    }

    loadAllUserPag();
  },[active])



  //Pagination

  

  let items = [];

  for (let number = 1; number <= pageCount; number++) {
    items.push(
      <Pagination.Item
        key={number}
        active={number === active}
        onClick={() => setActive(number)} // 🔥 click handler
      >
        {number}
      </Pagination.Item>
    );
  }




  return (
    <div>
        <ListGroup as="ol"  className="rounded overflow-hidden">
      {userList.map((user,index) => (
        <ListGroup.Item
          key={user.id}
          as="li"
          className="d-flex "
        >
          <div className='d-flex flex-row w-100'>
            <div className='d-flex'>
              <small className='me-2 m-0 p-0 bg-dark-subtle px-2 rounded mt-0'>{index}</small>
              <h6 className='m-0 p-0'>{user.username}</h6>
              <h6 className='ms-2 m-0 p-0'>{user.surname}</h6>
            </div>
            <div className='d-flex ms-auto'>
              
            <small className='ms-0 m-0 p-0 bg-success-subtle px-2 rounded mt-0'>{user.phone}</small>
            <small className='ms-2 m-0 p-0 bg-warning-subtle px-2 rounded mt-0'>{user.email}</small>
            <small className='ms-2 m-0 p-0 bg-primary-subtle px-2 rounded mt-0'>{user.role}</small>
            
            </div>
          </div>
          <div className='d-flex ms-5'>
            <Button variant='secondary p-0 px-3' style={{fontSize:"12px"}} className=''>Изменить</Button>
            <Button variant='secondary p-0 px-3 ms-2'  style={{fontSize:"12px"}} className=''>Удалить</Button>
          </div>
          
        </ListGroup.Item>
      ))}
    </ListGroup>

    <div className="mt-4">
      <Pagination>{items}</Pagination>
      <br />
      <p>Active page: {active}</p>
    </div>
    </div>
  );
}


export {UserListGroup}
