import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { addToCart } from '../actions/cartActions';
import { toast } from 'react-toastify';

export default function Product({ product }) {
  const [quantity, setQuantity] = useState(1);
  const [show, setShow] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

 
    

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const dispatch = useDispatch();

  function addtocart() {
    const selectedQuantity = parseInt(quantity, 10) || 1;
    dispatch(addToCart(product, selectedQuantity, isChecked));
    toast.success('Le produit est ajouté à la carte!', {
      position: 'bottom-right',
      autoClose: 3000,
      hideProgressBar: false
    });
  }
  const [imageSrc, setImageSrc] = useState('./greenheart.png');
  
  const handleClick = () => {
    setImageSrc(prevSrc => prevSrc === './greenheart.png' ? './heart1.png' : './greenheart.png');
    addtocart();
  };
const handleCheckboxChange = () => {
  setIsChecked(!isChecked);
};
  const calculatedPrice = isChecked ? 0 : product.Montant_TTC * quantity;
  const isMachineCategory = ['Machines Lavazza Firma','Nos Machines', 'Machines Grain Necta', 'Machines Lavazza Blue', 'Machines Lavazza Espresso Point', 'Machines Lavazza Amodo Mio', 'Machines Grain Gaggia', 'Machines Grain SAECO', 'Machine Grain Spaziale', 'Machines Grain Carimali'].includes(product.Categorie);
  const isMachineGrain = ['Nos Grains','Nos Promos','Capsules Lavazza Firma','Capsules Lavazza Blue'].includes(product.Categorie)
  return (
 
    <div className='mt-3 col-12 col-md-12 cart-product'> 
     
    
           <div style={{ backgroundColor: '#f3f3f3', borderTop: '0px solid #fffff', width:'100%', padding:'0px !important'}} className='mt-1 shop-card  bg-body'>
          <div onClick={handleShow}>
            <img src={product.Image} alt='product' className='img' style={{ height: isMachineGrain ? '140px' : '100%', width: '100px', overflow:'hidden', backgroundColor:'#f3f3f3 !important' }} />
          </div>
           
              <div className="product-tag1 justify-content-end">
              <img 
      src={imageSrc} 
      alt='ADD' 
      style={{ height: '18px', cursor: 'pointer' }} 
      onClick={handleClick} 
    />
							</div> 
        </div>
        
        
          <h6 className='pt-2 px-3 text-start text-truncate' style={{ fontSize:'11px'}}>{product.Nom}</h6>
            <div className='flex-container check  product-quantity'> 
         
            <input
              type='number'
              className='form-control'
              value={quantity}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (isNaN(value)) {
                  setQuantity('');
                } else {
                  setQuantity(Math.max(value, 1));
                }
              }} 
              min={1} 
            />  
               <label className='text-start grat-title'>
              <input
                
                type='checkbox'
                checked={isChecked}
                onChange={handleCheckboxChange}
                className=''
              /> {isMachineCategory ? 'Dépots ?' : '  Gratuit ?'}
          
            </label> 
       </div>
          <div className='flex-container'>
            <div className='product-price'>
              <h3>{calculatedPrice} DH TTC</h3>
            </div>
 


          </div>
       { /*
       
        <Modal className='col-12 col-md-12' show={show} style={{ widtht: '200px' }}>
            <Modal.Header  className='col-6 col-md-6' closeButton onClick={handleClose}>
              <Modal.Title>{product.Nom}</Modal.Title>
            </Modal.Header >
            <Modal.Body  className='col-6 col-md-6'  >
              <img src={product.Image} alt='product' className='img-fluid' style={{ height: '400px' }} />
              <p>{product.description}</p>
            </Modal.Body>
            <Modal.Footer  className='col-6 col-md-6'>
              <button className='btn' onClick={handleClose}>CLOSE</button>
            </Modal.Footer>
          </Modal>
       */ }
         
      
      </div>
    


  );
}
