import Dashboard from './pages/Dashboard';
import CreateInvoice from './pages/CreateInvoice';
import ViewInvoice from './pages/ViewInvoice';
import CompanyProfile from './pages/CompanyProfile';
import Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "CreateInvoice": CreateInvoice,
    "ViewInvoice": ViewInvoice,
    "CompanyProfile": CompanyProfile,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: Layout,
};