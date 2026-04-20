import React from 'react';
import ethLogo from '../../assets/1027.png';

interface EthIconProps {
  size?: number;
  className?: string;
}

const EthIcon: React.FC<EthIconProps> = ({ size = 30, className = "" }) => {
  return (
    <img 
      src={ethLogo} 
      alt="Ethereum" 
      style={{ width: size, height: size, objectFit: 'contain' }}
      className={className}
    />
  );
};

export default EthIcon;
