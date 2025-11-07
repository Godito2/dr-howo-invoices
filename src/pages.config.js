import Dashboard from './pages/Dashboard';
import CreateInvoice from './pages/CreateInvoice';
import ViewInvoice from './pages/ViewInvoice';
import Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "CreateInvoice": CreateInvoice,
    "ViewInvoice": ViewInvoice,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: Layout,
};