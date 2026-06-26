import ReactDOMServer from 'react-dom/server';
import { LandingPage } from './pages/LandingPage';

export function render() {
  return ReactDOMServer.renderToString(
    <LandingPage onNavigate={() => {}} />
  );
}
