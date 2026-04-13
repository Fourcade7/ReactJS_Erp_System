
import { useEffect,useState } from "react";
import { Alert,Collapse,Spinner,ProgressBar } from "react-bootstrap";


function AlertDismissibleDanger(props) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Sahifa yuklangandan 500ms o'tgach animatsiya boshlanadi
    const timer = setTimeout(() => {
      setShow(true);
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  return (
    /* 
      Muhim: Collapse ichida bitta o'rab turuvchi <div> bo'lishi shart!
      Aks holda animatsiya (collapse effekti) ishlamaydi.
    */
    <Collapse in={show}>
      <div> 
        <Alert  variant="danger"  onClose={() => setShow(false)} dismissible >
          <small>{props.alertMsg}</small>
        </Alert>
      </div>
    </Collapse>
  );
}

function ProgressDismissible() {
 
  return (
   
    
      <div className="d-flex flex-column"> 
        <Spinner className="mx-auto mt-3" animation="border" variant="primary" />
        <ProgressBar  className="my-3" animated variant="primary" now={100} />
      </div>
   
  );
}

function AlertDismissibleSuccess(props) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Sahifa yuklangandan 500ms o'tgach animatsiya boshlanadi
    const timer = setTimeout(() => {
      setShow(true);
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  return (
    /* 
      Muhim: Collapse ichida bitta o'rab turuvchi <div> bo'lishi shart!
      Aks holda animatsiya (collapse effekti) ishlamaydi.
    */
    <Collapse in={show}>
      <div> 
        <Alert  variant="success"  onClose={() => setShow(false)} dismissible >
          <small>{props.alertMsg}</small>
        </Alert>
      </div>
    </Collapse>
  );
}



export {AlertDismissibleDanger,AlertDismissibleSuccess,ProgressDismissible}
