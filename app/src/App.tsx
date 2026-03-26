import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import RegistroPage from './pages/RegistroPage';
import AdminPage from './pages/admin/AdminPage';
import JuradoPage from './pages/jurado/JuradoPage';
import PostulantePage from './pages/postulante/PostulantePage';

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        <Route exact path="/">
          <Redirect to="/login" />
        </Route>
        <Route exact path="/login" component={LoginPage} />
        <Route exact path="/registro" component={RegistroPage} />
        <Route path="/admin" component={AdminPage} />
        <Route path="/jurado" component={JuradoPage} />
        <Route path="/postulante" component={PostulantePage} />
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;
