import './LoadingBar.css';

const LoadingBar = ({ width }) => {
  return (
    <div className="loading_bar__container">
      <div className="loading_bar" style={{ width: `${width}%` }} ></div>
    </div>
  );
};

export default LoadingBar;
