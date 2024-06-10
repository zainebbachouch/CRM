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
import InvoicesDetails from './views/invoices/InvoicesDetails';
import Adminstration from './views/adminstration/adminstration';
import AuthorizationList from './views/authorization/AuthorizationList';
import UserPermissionsPage from './views/context/UserPermissionsPage';
import Profile from './components/sidenav/profile';
import Pageemployes from './views/adminstration/Pageemployes';
import Pageclients from './views/adminstration/Pageclients';
import EnvoyeeMail from './views/adminstration/EnvoyeeMail';
import MakeCall from './views/adminstration/MakeCall';
import Historique from './views/adminstration/Historique';
function App() {
  return (
    <>
      <Router>
        <AuthProvider>
          <UserPermissionsPage>
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
                  <Route path=":id" element={<ProductDetails />} />
                </Route>
                <Route path="Products">
                  <Route index element={<Products />} />
                </Route>
                <Route path="Commands">
                  <Route index element={<Commands />} />
                  <Route path=":id" element={<CommandDetails />} />
                </Route>

                <Route path="invoices" >
                  <Route index element={<Invoices />} />
                  <Route path=":id" element={<InvoicesDetails />} />
                </Route>

                <Route path="Categories">
                  <Route index element={<Categories />} />
                </Route>
                <Route path="adminstration">
                  <Route index element={<Adminstration />} />
                </Route>
                <Route path="authorization">
                  <Route index element={<AuthorizationList />} />
                </Route>
                <Route path="cart">
                  <Route index element={<GetCartProducts />} />
                </Route>
                <Route path="completeCommand">
                  <Route index element={<CompleteCommand />} />
                </Route>
                <Route path="profile">
                  <Route path=":id"  element={<Profile />} />
                </Route>


                <Route path="Pageemployes/:id" element={<Pageemployes />}>
                  <Route path="envoyeeMail" element={<EnvoyeeMail />} />
                  <Route path="makecall" element={<MakeCall />} /> 
                  <Route path="historique" element={<Historique />} />   
                </Route>


             
                <Route path="Pageclients">
                  <Route path=":id"  element={<Pageclients />} />                  
                </Route>

                </Route>
            </Routes>
          </UserPermissionsPage>
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;
