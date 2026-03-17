import Account from './pages/Account';
import CreateProject from './pages/CreateProject';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import Export from './pages/Export';
import MusicLibrary from './pages/MusicLibrary';
import Projects from './pages/Projects';
import Settings from './pages/Settings';
import Templates from './pages/Templates';
import Welcome from './pages/Welcome';
import ImageGenerator from './pages/ImageGenerator';
import Login from './pages/Login';
import __Layout from './Layout.jsx';

export const PAGES = {
  "Account": Account,
  "CreateProject": CreateProject,
  "Dashboard": Dashboard,
  "Editor": Editor,
  "Export": Export,
  "MusicLibrary": MusicLibrary,
  "Projects": Projects,
  "Settings": Settings,
  "Templates": Templates,
  "Welcome": Welcome,
  "Login": Login,
  "ImageGenerator": ImageGenerator,
};

export const pagesConfig = {
  mainPage: "Welcome",
  Pages: PAGES,
  Layout: __Layout,
};
