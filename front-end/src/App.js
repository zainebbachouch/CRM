import React from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Dashbord from './views/Dashbord';
import Products from './views/product/Products';
import ProductDetails from './views/product/ProductDetails';
import Commands from './views/commands/Commands';
import Invoices from './views/invoices/invoices';
import Categories from './views/categorie/Categories';
import Login from './views/login';
import Register from './views/register';
import Home from './views/Home';
import { AuthProvider } from './views/context/authContext';
import GetCartProducts from './components/sidenav/getCartProducts';
import CompleteCommand from './components/sidenav/completeCommand';
import CommandDetails from './views/commands/CommandDetails';

function App() {
  return (
    <>
      <Router>
        <AuthProvider>

          <Routes>
            <Route path="/">
              <Route index element={<Home />} />

              <Route path="login">
                <Route index element={<Login />} />
              </Route>
              <Route path="register">
                <Route index element={<Register />} />
              </Route>

              <Route path="Dashboard">
                <Route index element={<Dashbord />} />
              </Route>

              <Route path="Products">
                <Route index element={<Products />} />
                {/*<Route path=":productId" element={<Single />} />
                  <Route
                    path="new" element={<New inputs={productInputs} title="Add New Product" />}>
                     
                    */}
                  <Route path=":id" element={<ProductDetails />}/>
                   
              </Route>

              <Route path="Products">
                <Route index element={<Products />} />
              </Route>

              <Route path="Commands">
                <Route index element={<Commands />} />
                <Route path=":id" element={<CommandDetails />} />              </Route>

              <Route path="Invoices">
                <Route index element={<Invoices />} />
              </Route>

              <Route path="Categories">
                <Route index element={<Categories />} />

              </Route>
              
              <Route path="cart">
                <Route index element={<GetCartProducts />} />
              </Route>

              <Route path="completeCommand">
                  <Route index element={<CompleteCommand />} />
                </Route>


            </Route>
          </Routes>
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;
