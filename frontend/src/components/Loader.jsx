import React from 'react';
import Lottie from 'lottie-react';
import loadingAnimation from './loading.json';

const Loader = ({ style }) => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh', ...style }}>
    <Lottie animationData={loadingAnimation} loop={true} style={{ width: 120, height: 120 }} />
  </div>
);

export default Loader; 