import Dashboard from './pages/Dashboard';
import CreateInvoice from './pages/CreateInvoice';
import ViewInvoice from './pages/ViewInvoice';
import CompanyProfile from './pages/CompanyProfile';
import ProformaHistory from './pages/ProformaHistory';
import EditInvoice from './pages/EditInvoice';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "CreateInvoice": CreateInvoice,
    "ViewInvoice": ViewInvoice,
    "CompanyProfile": CompanyProfile,
    "ProformaHistory": ProformaHistory,
    "EditInvoice": EditInvoice,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};