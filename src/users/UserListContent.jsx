
import { ListGroup,Button ,Dropdown,Modal,Form,Spinner,ProgressBar} from "react-bootstrap";

import { useEffect, useState,useRef } from "react";

import Pagination from 'react-bootstrap/Pagination';
import { deleteUser, getAllUsersPagination } from "./UserApi";

import ellipsis from "../assets/ellipsis.png"
import "./user.css"


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
 
  const [showEdit, setShowEdit] = useState(false);
  const [showDel, setShowDel] = useState(false);
  const [showLoad, setShowLoad] = useState(false);
  const [showLoadTitle, setShowLoadTitle] = useState("Загрузка...");
  const [categoryName,setCategoryName]=useState("");
  const [categoryNameUZ,setCategoryNameUZ]=useState("");
  const [categoryNameEN,setCategoryNameEN]=useState("");
  const fileInputRef=useRef(null);
  const [uid, setUid] = useState(-1);


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
              <small className='me-2 m-0 p-0 bg-dark-subtle px-2 rounded mt-0'>{index+1}</small>
              <small className='me-2 m-0 p-0 bg-dark-subtle px-2 rounded mt-0'>{user.id}</small>
              <h6 className='m-0 p-0'>{user.username}</h6>
              <h6 className='ms-2 m-0 p-0'>{user.surname}</h6>
            </div>
            <div className='d-flex ms-auto'>
              
            <small className='ms-0 m-0 p-0 bg-success-subtle px-2 rounded mt-0'>{user.phone}</small>
            <small className='ms-2 m-0 p-0 bg-warning-subtle px-2 rounded mt-0'>{user.email}</small>
            <small className='ms-2 m-0 p-0 bg-primary-subtle px-2 rounded mt-0'>{user.role}</small>
            
            </div>
          </div>
          <div className='d-flex ms-3'>
          
           <Dropdown>
            <Dropdown.Toggle as="div" className="bg-dark-subtle px-3 rounded" style={{ cursor: 'pointer' }}>
              Опции  
            </Dropdown.Toggle>

            <Dropdown.Menu 
              className="my-dropdown" 
              align="end" 
              popperConfig={{ strategy: 'fixed' }} // 🔥 Mana shu qator menyuni overflow-dan qutqaradi
            >
              <Dropdown.Item onClick={() => { setShowEdit(true); setUid(user.id); }}>
                Изменить
              </Dropdown.Item>
              <Dropdown.Item onClick={() => { setShowDel(true); setUid(user.id); }}>
                Удалить
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          

            {/* <Button variant='secondary p-0 px-3' style={{fontSize:"12px"}} className=''>Изменить</Button>
            <Button variant='secondary p-0 px-3 ms-2'  style={{fontSize:"12px"}} className=''>Удалить</Button> */}
          </div>
          
        </ListGroup.Item>
      ))}
    </ListGroup>

    <div className="mt-4">
      <Pagination>{items}</Pagination>
      
    </div>



      {
            //Edit
            }
            <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
                <Modal.Header closeButton>
                <Modal.Title>Редактировать</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <small>Название категории</small>
                     <Form.Control className="mt-2" type="text" placeholder="введите название категории RUS"
                        value={categoryName}
                        onChange={(e)=>{setCategoryName(e.target.value)}}
                        />
                        <Form.Control className="mt-2" type="text" placeholder="введите название категории UZB"
                        value={categoryNameUZ}
                        onChange={(e)=>{setCategoryNameUZ(e.target.value)}}
                        />
                        <Form.Control className="mt-2" type="text" placeholder="введите название категории ENG"
                        value={categoryNameEN}
                        onChange={(e)=>{setCategoryNameEN(e.target.value)}}
                        />
                    
                      <Form.Group controlId="formFile" className="mt-3">
                          <small>Выберите изображение</small>
                          <Form.Control type="file" ref={fileInputRef} />
                      </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                <Button variant="secondary" 
                onClick={() => setShowEdit(false)}>
                   Отмена
                </Button>
                <Button variant="warning" 
                 onClick={async()=>{
                 
                 //await updateCategory(cid,categoryName,categoryNameUZ,categoryNameEN,fileInputRef.current.files[0]);
                 //let result = await addCategory(categoryName,fileInputRef.current.files[0]);
                 setShowEdit(false)
                 
                }}
                >
                    Сохранять
                </Button>
                </Modal.Footer>
            </Modal>
            {
            //delete
            }

            <Modal show={showDel} onHide={() => setShowDel(false)} centered>
                        <Modal.Header closeButton>
                        <Modal.Title>Удалить</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>Вы уверены, что хотите его удалить?</Modal.Body>
                        <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowDel(false)}>
                            Отмена
                        </Button>
                        <Button variant="danger" 
                        onClick={ async ()=>{
                          setShowLoadTitle("Загрузка...")
                          setShowDel(false);
                          setShowLoad(true);
                          
                          //await deleteCategory(cid);
                          const res = await deleteUser(uid);
                          const deleteResponse = await res.json();
                          console.log(deleteResponse.message); 
                          setTimeout(() => {
                            console.log("log");
                            setShowDel(false);
                          }, 2000);                         
                          
                          setShowLoadTitle("Ishlidi axir")

                           setTimeout(() => {
                            setShowLoad(false);
                          }, 2000);
                          
                          //window.location.reload();
                        }
                }>
                    Удалить
                </Button>
                </Modal.Footer>
            </Modal>

            {
             //Loading
            }

            <Modal show={showLoad} onHide={() => setShowLoad(false)} centered>
                        <Modal.Header closeButton>
                        <Modal.Title>{showLoadTitle}</Modal.Title>
                        </Modal.Header>
                        
                        <div className="d-flex flex-column mx-4"> 
                          
                          <Spinner className="mx-auto mt-3" animation="border" variant="primary" />
                          <Modal.Body className="mx-auto">Пожалуйста, подождите</Modal.Body>
                          <ProgressBar  className="my-3" animated variant="primary" now={100} />
                          
                        </div>

                        
            </Modal>
    </div>
  );
}


export {UserListGroup}
