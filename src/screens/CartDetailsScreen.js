import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { toast } from 'react-toastify';
import Loading from '../components/Loading';
import Error from '../components/Error';
import { getUserOrders } from '../actions/orderActions';

const formatDate = (date) => {
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) {
    month = '0' + month;
  }
  if (day.length < 2) {
    day = '0' + day;
  }

  return [month, day, year].join('/');
};

const CartDetailsScreen = () => {
  const dispatch = useDispatch();
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  const orderState = useSelector(state => state.getUserOrdersReducer);
  const { orders, error, loading } = orderState;

  const [productName, setProductName] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [clientCode, setClientCode] = useState('');

  useEffect(() => {
    dispatch(getUserOrders());
  }, [dispatch]);

  const handleProductNameChange = (e) => {
    setProductName(e.target.value);
  };

  const handleOrderDateChange = (e) => {
    setOrderDate(e.target.value);
  };

  const handleClientCodeChange = (e) => {
    setClientCode(e.target.value);
  };

  const filterOrders = () => {
    return orders.filter(order => {
      const orderDateStr = order.ORDDAT.slice(0, 10); // Extract the date part in YYYY-MM-DD format
      return order.ITMDES.toLowerCase().includes(productName.toLowerCase()) &&
             (orderDate ? orderDateStr === orderDate : true) &&
             (order.BPCORD ? order.BPCORD.toLowerCase().includes(clientCode.toLowerCase()) : true);
    });
  };

  const groupOrdersByNumber = (orders) => {
    const groupedOrders = {};
    orders.forEach(order => {
      if (!groupedOrders[order.SOHNUM]) {
        groupedOrders[order.SOHNUM] = {
          orderInfo: order,
          items: []
        };
      }
      groupedOrders[order.SOHNUM].items.push(order);
    });
    return Object.values(groupedOrders);
  };

  const calculateTotalTOTLIN = (groupedOrders) => {
    return groupedOrders.reduce((total, group) => total + group.orderInfo.TOTLIN, 0);
  };

  const generateOrderPDF = (orderGroup) => {
    const doc = new jsPDF();
    const logoImg = new Image();
    logoImg.src = '../logo.jpg'; // Ensure the path is correct

    // Calculate total price and quantity
    const totalQuantity = orderGroup.items.reduce((total, item) => total + item.QTY, 0);
    const totalP = orderGroup.items.reduce((total, item) => total + item.NETPRI, 0);
    const totalPrice = orderGroup.items.reduce((total, item) => total + item.TOTLIN, 0);

    logoImg.onload = () => {
      doc.addImage(logoImg, 'JPG', 25, 15, 30, 20); // x, y, width, height
      doc.setFontSize(15);
      doc.setFont("helvetica", "bold");
      doc.setTextColor('#003f7e');
      doc.text(`TOP CLASS ESPRESSO`, 120, 20);
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
     
      doc.text(`E :` + currentUser.EMAILUSR, 120, 35);
      doc.text(`P:   ` + currentUser.TELEP, 120, 40);
      doc.text(`DETAIL COMMANDE`, 15, 55);

      const columns = ["", ""];
      const rows = [
        ["Collaborateur :", currentUser.NOMUSR],
        ["Date :", formatDate(orderGroup.orderInfo.ORDDAT)], // Use formatted date here
        ["Client Code :", orderGroup.orderInfo.BPCORD],
      
      ];

      doc.autoTable({
        startY: 60,
        head: [columns],
        body: rows,
        theme: 'plain',
        styles: { cellPadding: 1, fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 100 }
        }
      });
      doc.setFontSize(25); // Set font size
      doc.setFont("helvetica", "bold"); // Set font to Helvetica and make it bold
      doc.setTextColor('#003f7e'); // Set text color to blue (RGB format)
      doc.text(`BON DE COMMANDE`, 55, 100);

      const tableColumns = ['Name', 'Gratuit','Quantity', 'PriceU','Total TTC'];
      const tableRows = orderGroup.items.map(item => [item.ITMDES,item.GRAT == 1 ? 'Oui' : 'Non', item.QTY, `${item.NETPRI} DH`,`${item.TOTLIN} DH`]);

      doc.autoTable({
        startY: 110,
        head: [tableColumns],
        styles: { cellPadding: 1, fontSize: 10 },
        body: tableRows,
        foot: [[ '','Total' ,totalQuantity,`-` ,`${totalPrice} DH`]],
        headStyles: { fillColor: '#063970' },  // Light grey background
        footStyles: { fillColor: '#063970' },
        didDrawPage: function (data) {
          // Calculate the position for the custom text
          let pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
          let textY = data.cursor.y + 35; // Add 10 units below the table
          let textX = data.settings.margin.left + 30;
          // Add custom text after the table foot
          doc.setFontSize(15); 
          doc.setFont("helvetica", "bold"); // Set font to Helvetica and make it bold
          doc.setTextColor('#00000'); // Set text color to blue (RGB format)
          doc.text("VISA", textX, textY);
      }
      });



      doc.save(`order_${formatDate(orderGroup.orderInfo.ORDDAT)}.pdf`);
      toast.success('Your order PDF is exported!', {
        position: 'bottom-right',
        autoClose: 3000,
        hideProgressBar: false
      });
    };
  };

  /*const generateGlobalPDF = () => {
    const doc = new jsPDF();
    const logoImg = new Image();
    logoImg.src = '../logo.jpg'; // Ensure the path is correct

    logoImg.onload = () => {
      doc.addImage(logoImg, 'JPG', 25, 15, 30, 20); // x, y, width, height
      doc.setFontSize(15);
      doc.setFont("helvetica", "bold");
      doc.setTextColor('#003f7e');
      doc.text(`TOP CLASS ESPRESSO`, 120, 20);
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      doc.text(`E :   ` + currentUser.EMAILUSR, 120, 35);
      doc.text(`P:   ` + currentUser.TELEP, 120, 40);
      
     
 
      doc.text(`DETAIL COMMANDE`, 15, 55);

      const columns = ["", ""];
      const rows = [
        ["Collaborateur :", currentUser.NOMUSR],
  
      ];

      doc.autoTable({
        startY: 60,
        head: [columns],
        body: rows,
        theme: 'plain',
        styles: { cellPadding: 1, fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 100 }
        }
      });
      doc.setFontSize(25); // Set font size
      doc.setFont("helvetica", "bold"); // Set font to Helvetica and make it bold
      doc.setTextColor('#003f7e'); // Set text color to blue (RGB format)
      doc.text(`BON DE COMMANDE GLOBALE`, 40, 100);
     

      const tableColumns = ['Order ID', 'Client', 'Item Name',  'Quantity', 'Price (DH)','Total TTC'];
      const globalTableRows = [];

      const filteredOrders = groupOrdersByNumber(filterOrders()); // Group orders by number

      filteredOrders.forEach(group => {
        group.items.forEach((item, index) => {
   
          globalTableRows.push([index === 0 ? group.orderInfo.SOHNUM : '', index === 0 ? group.orderInfo.BPCORD : '',item.ITMDES , item.QTY,`${item.NETPRI} DH`, `${item.TOTLIN} DH`]);
         
        });
      });

      const totalPrice = filteredOrders.reduce((acc, group) => acc + group.items.reduce((subAcc, item) => subAcc + item.NETPRI, 0), 0);
      const totalQuantity = filteredOrders.reduce((acc, group) => acc + group.items.reduce((subAcc, item) => subAcc + item.QTY, 0), 0);
      const totalTTC = filteredOrders.reduce((acc, group) => acc + group.items.reduce((subAcc, item) => subAcc + item.TOTLIN, 0), 0);
      doc.autoTable({
        startY: 110,
        head: [tableColumns],
        body: globalTableRows,
        foot: [['','',  'Total' ,totalQuantity,`${totalPrice} DH` ,`${totalTTC} DH`]],
        headStyles: { fillColor: '#063970' },  // Light grey background
        footStyles: { fillColor: '#063970' },
        didDrawPage: function (data) {
          // Calculate the position for the custom text
          let pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
          let textY = data.cursor.y + 35; // Add 10 units below the table
          let textX = data.settings.margin.left + 30;
          // Add custom text after the table foot
          doc.setFontSize(15); 
          doc.setFont("helvetica", "bold"); // Set font to Helvetica and make it bold
          doc.setTextColor('#00000'); // Set text color to blue (RGB format)
          doc.text("VISA", textX, textY);
      }
      });

 
      doc.save('global_order_details.pdf');
      toast.success('Your global order PDF is exported!', {
        position: 'bottom-right',
        autoClose: 3000,
        hideProgressBar: false
      });
    };
  };*/

  const groupedOrders = groupOrdersByNumber(filterOrders());
  const totalTOTLIN = calculateTotalTOTLIN(groupedOrders);

  return (
    <div className="container justify-content-center col-12 col-xl-12 col-md-12 mt-2 mx-auto orders-details">
      <div className="mb-1 pb- titre-pages">
        <h6>Mes Commandes</h6>
      
      { /*<h2>Total price: {totalTOTLIN} DH</h2>*/  }  
      </div>
      <div className="">
        <input
          type="text"
          placeholder="Rechercher par le nom du produit"
          value={productName}
          onChange={handleProductNameChange}
          className="form-control bg-body rounded"
          style={{fontSize:'12px'}}
          
        />
        <input
          type="date"
          
          value={orderDate}
          onChange={handleOrderDateChange}
          className="form-control mt-1 bg-body rounded"
          style={{fontSize:'12px'}}
        />
        <input
          type="text"
          placeholder="Rechercher par le code client"
          value={clientCode}
          onChange={handleClientCodeChange}
          className="form-control mt-1  bg-body rounded"
          style={{fontSize:'12px'}}
        />
      </div>
      {loading && <Loading />}
      {error && <Error error="Something went wrong" />}
      {orders && (
        <>
          {groupedOrders.map(group => (
            <div className="cart-items order-items col-12 col-md-12 mt-2" key={group.orderInfo.SOHNUM} >
                    

<table class="details-order-table">
<tr>
<td style={{width:'45%'}}><h6>N° de commande :</h6></td><td><span>{group.orderInfo.SOHNUM} </span></td>
</tr>
<tr>
<td style={{width:'45%'}}><h6>Client :</h6></td><td><span>{group.orderInfo.BPCORD}</span></td>
</tr>
<tr>
<td style={{width:'45%'}}><h6>Date Commande :</h6></td><td><span> {formatDate(group.orderInfo.ORDDAT)}</span></td>
</tr>

<tr >
<td colspan="2" class="button-export" onClick={() => generateOrderPDF(group)}><button>Télécharger</button></td>
</tr>


</table>

           
              {group.items.map(item => (
                <div className='flex-container col-12 col-md-12' key={item.ID} style={{ backgroundColor: '' }}>
                  <div style={{ border: 'none',  backgroundColor: ''}} className="card col-12 col-md-12 mx-auto p-1 mb-2 bg-white">
                 
                 
                     
                        <div className="card-body text-start col-12 col-md-12">
                          
                          <h6 className="card-title flex-container col-12 col-md-12">{item.ITMDES} <p className="card-text inline" style={{ fontSize: '13px',fontWeight:'bold',paddingLeft:'20px' }}>x {item.QTY}</p></h6>
                          
                          <p className="card-price">{item.NETPRI} DH</p> {/* Use formatted date here */}
                        
                         
                        </div>
                     
               
               
                  </div>
                </div>
              ))}
            </div>
          ))}
        </>
      )}
      {/*<button onClick={generateGlobalPDF} style={{ fontSize: '25px', border: '0px' }} className="btn btn-primary mt-2" type="button">
        All commandes en &nbsp;
        <i className="fa fa-file-pdf-o"></i>
    </button>*/}
     <footer className="menubar-area footer-fixed bg-light mt-1 shadow-lg" >
      <div className="toolbar-inner menubar-nav d-flex justify-content-around">
        <a href="/" className="nav-link active">
          <i className="bi bi-house-door row   justify-content-center m-3" ></i>
          <span >Acceuil</span>
        </a>
        <a href="/orders" className="nav-link">
          <i className="bi bi-grid  row  justify-content-center m-3"></i>
          <span>Commandes</span>
        </a>
        <a href="/cart" className="nav-link">
          <i className="bi bi-heart  row  justify-content-center m-3"></i>
          <span>Panier</span>
        </a>
      </div>
    </footer>  
    </div>
  );
};

export default CartDetailsScreen;
