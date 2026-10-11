import { useState, useEffect } from 'react'
import store from './store';
import { loadUser } from './actions/userActions';
import './App.css'

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer, } from 'react-toastify';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';



import Navbar from './Components/Layout/Navbar'
import Footer from './Components/Layout/Footer'
import Home from './Components/Home'
import Shop from './Components/Product/Shop'
import Stories from './Components/Stories/Stories'
import StoryDetail from './Components/Stories/StoryDetail'
import Company from './Components/Company/Company'
import ProductDetails from './Components/Product/ProductDetails'
import Register from './Components/User/Register'
import Login from './Components/User/Login'
import NewPassword from './Components/User/NewPassword';
import ForgotPassword from './Components/User/ForgotPassword';
import Profile from './Components/User/Profile';
import UpdateProfile from './Components/User/UpdateProfile';
import UpdatePassword from './Components/User/UpdatePassword';
import Cart from './Components/Cart/Cart';
import Shipping from './Components/Cart/Shipping';
import ConfirmOrder from './Components/Cart/ConfirmOrder';
import Payment from './Components/Cart/Payment';
import OrderSuccess from './Components/Cart/OrderSuccess';
import ListOrders from './Components/Order/ListOrders';
import OrderDetails from './Components/Order/OrderDetails';
import PublicLayout from './Components/Layout/PublicLayout';
import AdminLayout from './Components/Admin/Layout/AdminLayout';
import Dashboard from './Components/Admin/Dashboard';
import ProductsList from './Components/Admin/ProductsList';
import NewProduct from './Components/Admin/NewProduct';
import UpdateProduct from './Components/Admin/UpdateProduct';
import OrdersList from './Components/Admin/OrdersList';
import ProcessOrder from './Components/Admin/ProcessOrder';
import UsersList from './Components/Admin/UsersList';
import UpdateUser from './Components/Admin/UpdateUser';
import ProtectedRoute from './Components/Route/ProtectedRoute';
import ProductReviews from './Components/Admin/ProductReviews';

function App() {

  const [state, setState] = useState({
    cartItems: localStorage.getItem('cartItems')
      ? JSON.parse(localStorage.getItem('cartItems'))
      : [],

    shippingInfo: localStorage.getItem('shippingInfo')
      ? JSON.parse(localStorage.getItem('shippingInfo'))
      : {},
  })

  useEffect(() => {
    store.dispatch(loadUser());
  }, []);

  const addItemToCart = async (id, quantity) => {
    // console.log(id, quantity)
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API}/product/${id}`)
      const item = {
        product: data.product._id,
        name: data.product.name,
        price: data.product.price,
        image: data.product.images[0].url,
        stock: data.product.stock,
        quantity: quantity
      }

      const isItemExist = state.cartItems.find(i => i.product === item.product)

      // setState({
      //   ...state,
      //   cartItems: [...state.cartItems, item]
      // })
      if (isItemExist) {
        setState({
          ...state,
          cartItems: state.cartItems.map(i => i.product === isItemExist.product ? item : i)
        })
      }
      else {
        setState({
          ...state,
          cartItems: [...state.cartItems, item]
        })
      }

      toast.success('Item Added to Cart', {
        position: 'bottom-right'
      })


    } catch (error) {
      toast.error(error, {
        position: 'top-left'
      });

    }

  }
  // localStorage.setItem('cartItems', JSON.stringify(state.cartItems))
  const removeItemFromCart = async (id) => {
    const updatedCart = state.cartItems.filter(i => i.product !== id);
    setState({
      ...state,
      cartItems: updatedCart
    })
    localStorage.setItem('cartItems', JSON.stringify(updatedCart))
  }

  const clearCart = () => {
    setState({
      ...state,
      cartItems: []
    })
    localStorage.removeItem('cartItems')
  }

  const saveShippingInfo = async (data) => {
    setState({
      ...state,
      shippingInfo: data
    })
    localStorage.setItem('shippingInfo', JSON.stringify(data))
  }
  return (
    <>


      <Router>
        <Routes>
          {/* Public Storefront Shell (Single-Row Navbar + Content + Footer) */}
          <Route element={<PublicLayout cartItems={state.cartItems} />}>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/catalog" element={<Shop />} />
            <Route path="/stories" element={<Stories />} />
            <Route path="/stories/:slug" element={<StoryDetail />} />
            <Route path="/company" element={<Company />} />
            <Route path="/product/:id" element={<ProductDetails cartItems={state.cartItems} addItemToCart={addItemToCart} />} />
            <Route path="/search/:keyword" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/password/forgot" element={<ForgotPassword />} />
            <Route path="/password/reset/:token" element={<NewPassword />} />
            <Route path="/me" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/me/update" element={<ProtectedRoute><UpdateProfile /></ProtectedRoute>} />
            <Route path="/password/update" element={<ProtectedRoute><UpdatePassword /></ProtectedRoute>} />
            <Route path="/cart" element={<Cart cartItems={state.cartItems} addItemToCart={addItemToCart} removeItemFromCart={removeItemFromCart} />} />
            <Route path="/shipping" element={<ProtectedRoute><Shipping shipping={state.shippingInfo} saveShippingInfo={saveShippingInfo} /></ProtectedRoute>} />
            <Route path="/confirm" element={<ProtectedRoute><ConfirmOrder cartItems={state.cartItems} shippingInfo={state.shippingInfo} /></ProtectedRoute>} />
            <Route path="/payment" element={<ProtectedRoute><Payment cartItems={state.cartItems} shippingInfo={state.shippingInfo} clearCart={clearCart} /></ProtectedRoute>} />
            <Route path="/success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
            <Route path="/orders/me" element={<ProtectedRoute><ListOrders /></ProtectedRoute>} />
            <Route path="/order/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
          </Route>

          {/* Dedicated Admin Shell (Slim Rail Sidebar + Admin Header + No Public Navbar/Footer) */}
          <Route element={<ProtectedRoute isAdmin={true}><AdminLayout /></ProtectedRoute>}>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin/products" element={<ProductsList />} />
            <Route path="/admin/product" element={<NewProduct />} />
            <Route path="/admin/product/:id" element={<UpdateProduct />} />
            <Route path="/admin/orders" element={<OrdersList />} />
            <Route path="/admin/order/:id" element={<ProcessOrder />} />
            <Route path="/admin/users" element={<UsersList />} />
            <Route path="/admin/user/:id" element={<UpdateUser />} />
            <Route path="/admin/reviews" element={<ProductReviews />} />
          </Route>
        </Routes>
      </Router>
      <ToastContainer theme="dark" />
    </>
  )
}

export default App
