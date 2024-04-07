import React from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Dashbord from './views/Dashbord';
import Products from './views/Products';
import Commands from './views/Commands';
import Invoices from './views/invoices';
import Categories from './views/Categories';
import Login from './views/login';
import Register from './views/register';
import Home from './views/Home';

function App() {
  return (
    <>
      <Router>
      
        <Routes>
          <Route path="/">
          <Route index element={<Home />} />

          <Route path="login">
              <Route index element={<Login />} />
            </Route>
            <Route path="register">
              <Route index element={<Register />} />
            </Route>
            
            <Route path="Dashbord">
            <Route index element={<Dashbord />} />
            </Route>
           
            <Route path="Products">
              <Route index element={<Products />} />
              {/*<Route path=":productId" element={<Single />} />
                  <Route
                    path="new" element={<New inputs={productInputs} title="Add New Product" />}>*/}
            </Route>

            <Route path="Products">
              <Route index element={<Products />} />
            </Route>

            <Route path="Commands">
              <Route index element={<Commands />} />
            </Route>

            <Route path="Invoices">
              <Route index element={<Invoices />} />
            </Route>

            <Route path="Categories">
              <Route index element={<Categories />} />
            </Route>

          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
