import logo from './logo.svg';
import './App.css';
import { Link } from 'react-router-dom';
import Fib from './Fib';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <Link to={"/"}>Home</Link>
        <Link to={"/otherPage"}>Other Page</Link>
      </header>
      <div>
        <Fib />
      </div>
    </div>
  );
}

export default App;
